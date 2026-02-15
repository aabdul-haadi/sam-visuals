import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  media_type: 'image' | 'video' | 'youtube';
  media_url: string;
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  display_order: number;
}

export interface PortfolioData {
  logos: PortfolioItem[];
  posters: PortfolioItem[];
  shorts: PortfolioItem[];
  longvideos: PortfolioItem[];
  aivideos: PortfolioItem[];
}

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  portfolioData: PortfolioData;
  fetchPortfolioData: () => Promise<void>;
  updatePortfolioItem: (item: PortfolioItem) => Promise<boolean>;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'display_order'>) => Promise<boolean>;
  deletePortfolioItem: (id: string) => Promise<boolean>;
  uploadMedia: (file: File, category: string) => Promise<string | null>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const emptyPortfolio: PortfolioData = {
  logos: [],
  posters: [],
  shorts: [],
  longvideos: [],
  aivideos: [],
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(emptyPortfolio);

  // Check auth status on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('sam-visuals-admin-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Fetch portfolio data on mount and set up realtime subscription
  useEffect(() => {
    fetchPortfolioData();

    // Set up realtime subscription for portfolio_items
    const channel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_items'
        },
        () => {
          // Refetch data on any change
          fetchPortfolioData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPortfolioData = async () => {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching portfolio:', error);
      return;
    }

    const grouped: PortfolioData = {
      logos: [],
      posters: [],
      shorts: [],
      longvideos: [],
      aivideos: [],
    };

    data?.forEach((item) => {
      const category = item.category as keyof PortfolioData;
      if (grouped[category]) {
        grouped[category].push({
          ...item,
          description: (item as any).description || null,
        } as PortfolioItem);
      }
    });

    setPortfolioData(grouped);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('password_hash')
        .eq('username', username)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      const isValid = await bcrypt.compare(password, data.password_hash);
      
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('sam-visuals-admin-auth', 'true');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sam-visuals-admin-auth');
  };

  const uploadMedia = async (file: File, category: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${category}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'display_order'>): Promise<boolean> => {
    try {
      // Get max display order for category
      const categoryItems = portfolioData[item.category as keyof PortfolioData] || [];
      const maxOrder = Math.max(...categoryItems.map(i => i.display_order), -1);

      // Use maybeSingle() to avoid false negatives when the backend returns 0 rows.
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert({
          category: item.category,
          title: item.title,
          media_url: item.media_url,
          media_type: item.media_type,
          youtube_url: item.youtube_url,
          thumbnail_url: item.thumbnail_url,
          description: item.description,
          display_order: maxOrder + 1,
        })
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Add error:', error);
        return false;
      }

      // If we got the inserted row back, update local state instantly.
      if (data) {
        setPortfolioData(prev => {
          const category = item.category as keyof PortfolioData;
          if (prev[category]) {
            return {
              ...prev,
              [category]: [...prev[category], data as PortfolioItem]
            };
          }
          return prev;
        });
      } else {
        // Otherwise, refetch to ensure UI is correct.
        await fetchPortfolioData();
      }

      return true;
    } catch (err) {
      console.error('Add error:', err);
      return false;
    }
  };

  const updatePortfolioItem = async (item: PortfolioItem): Promise<boolean> => {
    const { error } = await supabase
      .from('portfolio_items')
      .update({
        title: item.title,
        description: item.description,
        media_url: item.media_url,
        media_type: item.media_type,
        youtube_url: item.youtube_url,
        thumbnail_url: item.thumbnail_url,
      })
      .eq('id', item.id);

    if (error) {
      console.error('Update error:', error);
      return false;
    }

    // Immediately update local state
    setPortfolioData(prev => {
      const category = item.category as keyof PortfolioData;
      if (prev[category]) {
        return {
          ...prev,
          [category]: prev[category].map(i => i.id === item.id ? item : i)
        };
      }
      return prev;
    });

    return true;
  };

  const deletePortfolioItem = async (id: string): Promise<boolean> => {
    // Find the item first to know its category
    let itemCategory: keyof PortfolioData | null = null;
    for (const [category, items] of Object.entries(portfolioData)) {
      if (items.find(i => i.id === id)) {
        itemCategory = category as keyof PortfolioData;
        break;
      }
    }

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    // Immediately update local state
    if (itemCategory) {
      setPortfolioData(prev => ({
        ...prev,
        [itemCategory]: prev[itemCategory].filter(i => i.id !== id)
      }));
    }

    return true;
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        portfolioData,
        fetchPortfolioData,
        updatePortfolioItem,
        addPortfolioItem,
        deletePortfolioItem,
        uploadMedia,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
