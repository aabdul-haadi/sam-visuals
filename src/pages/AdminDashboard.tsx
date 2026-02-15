import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Plus, Pencil, Trash2, Image, Video, FileImage, Layers,
  X, Save, Home, Upload, Link as LinkIcon, Youtube, Info, Smartphone,
  Mail, FileText, Settings, Eye, Check, Clock, Archive, GripVertical, Phone,
  Sparkles, Wand2
} from 'lucide-react';
import { useAdmin, PortfolioItem } from '@/context/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { refreshSiteContent } from '@/hooks/use-site-content';

type Category = 'logos' | 'posters' | 'shorts' | 'longvideos' | 'aivideos';
type MediaType = 'image' | 'video' | 'youtube';
type AdminTab = 'portfolio' | 'content' | 'contacts';

interface ContactSubmission {
  id: string; name: string; email: string | null; phone: string | null; project: string | null; service: string;
  description: string; status: string; created_at: string;
}

interface SiteContent {
  id: string; section_key: string; title: string | null; subtitle: string | null;
  description: string | null; content: any; updated_at: string;
}

const categoryIcons = { logos: Layers, posters: FileImage, shorts: Smartphone, longvideos: Video, aivideos: Sparkles };
const categoryLabels = { logos: 'Logos', posters: 'Posters', shorts: 'YT Shorts', longvideos: 'Long Videos', aivideos: 'AI Videos' };
const categorySizeGuides: Record<Category, { width: string; height: string; description: string }> = {
  logos: { width: '800px', height: '800px', description: 'Square format (1:1 ratio). Recommended: 800x800px or higher' },
  posters: { width: '800px', height: '1200px', description: 'Portrait format (2:3 ratio). Recommended: 800x1200px' },
  shorts: { width: '1080px', height: '1920px', description: 'Phone vertical format (9:16 ratio). Recommended: 1080x1920px' },
  longvideos: { width: '1920px', height: '1080px', description: 'Full HD video (16:9 ratio). Recommended: 1920x1080px' },
  aivideos: { width: '1080px', height: '1920px', description: 'AI Videos - Size configurable from CMS (9:16 or 16:9). Upload or paste links.' },
};

const sectionLabels: Record<string, string> = {
  hero: 'Hero Section', services: 'Services Section', features: 'Features Section',
  pricing: 'Pricing Section', faq: 'FAQ Section', contact: 'Contact Section',
  footer: 'Footer', testimonials: 'Testimonials Section', process: 'Process Section',
  featured_video: 'Featured Video Section', ai_videos: 'AI Videos Section',
};

// Define what content fields each section supports
const sectionContentSchema: Record<string, { type: string; label: string; fields: { key: string; label: string; type?: string }[] }> = {
  services: {
    type: 'list', label: 'Services',
    fields: [
      { key: 'title', label: 'Service Title' },
      { key: 'description', label: 'Description' },
      { key: 'features', label: 'Features (comma-separated)', type: 'features' },
    ],
  },
  features: {
    type: 'list', label: 'Features',
    fields: [
      { key: 'title', label: 'Feature Title' },
      { key: 'description', label: 'Description' },
    ],
  },
  faq: {
    type: 'list', label: 'FAQs',
    fields: [
      { key: 'question', label: 'Question' },
      { key: 'answer', label: 'Answer', type: 'textarea' },
    ],
  },
  process: {
    type: 'list', label: 'Process Steps',
    fields: [
      { key: 'number', label: 'Step Number' },
      { key: 'title', label: 'Step Title' },
      { key: 'description', label: 'Description' },
    ],
  },
  pricing: {
    type: 'pricing', label: 'Pricing Plans',
    fields: [], // handled by custom pricing editor
  },
  testimonials: {
    type: 'list', label: 'Testimonials',
    fields: [
      { key: 'client_name', label: 'Client Name' },
      { key: 'client_role', label: 'Role / Title' },
      { key: 'client_avatar', label: 'Avatar URL' },
      { key: 'rating', label: 'Rating (1-5)' },
      { key: 'review', label: 'Review', type: 'textarea' },
    ],
  },
  hero: {
    type: 'hero', label: 'Hero Content',
    fields: [
      { key: 'badge', label: 'Badge Text' },
      { key: 'heading_line1', label: 'Heading Line 1' },
      { key: 'heading_highlight', label: 'Highlighted Text' },
      { key: 'heading_line2', label: 'Heading Line 2' },
      { key: 'cta_primary', label: 'Primary CTA Text' },
      { key: 'cta_secondary', label: 'Secondary CTA Text' },
    ],
  },
  featured_video: {
    type: 'simple', label: 'Featured Video',
    fields: [
      { key: 'youtube_url', label: 'YouTube Video URL' },
    ],
  },
  ai_videos: {
    type: 'simple', label: 'AI Videos Settings',
    fields: [
      { key: 'display_size', label: 'Display Size (reel or video)' },
    ],
  },
  contact: {
    type: 'list', label: 'Service Options',
    fields: [
      { key: 'value', label: 'Value (slug)' },
      { key: 'label', label: 'Display Label' },
    ],
  },
};

const contentListKey: Record<string, string> = {
  services: 'services', features: 'features', faq: 'faqs', process: 'steps',
  pricing: 'pricing', testimonials: 'testimonials', hero: 'hero',
  featured_video: 'featured_video', ai_videos: 'ai_videos', contact: 'service_options',
};

function getYouTubeThumbnail(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return null;
  } catch { return null; }
}

// Content List Editor Component
function ContentListEditor({ 
  items, schema, onChange 
}: { 
  items: any[]; 
  schema: typeof sectionContentSchema[string]; 
  onChange: (items: any[]) => void;
}) {
  const addItem = () => {
    const newItem: any = {};
    schema.fields.forEach(f => { newItem[f.key] = f.type === 'features' ? [] : ''; });
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">{schema.label} ({items.length})</h4>
        <button type="button" onClick={addItem}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium">
          <Plus className="w-3 h-3" />Add
        </button>
      </div>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div key={index} className="p-3 rounded-xl bg-muted/50 border border-border space-y-2 relative group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {schema.label.replace(/s$/, '')} #{index + 1}
              </span>
              <button type="button" onClick={() => removeItem(index)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {schema.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={item[field.key] || ''}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  />
                ) : field.type === 'features' ? (
                  <input
                    type="text"
                    value={Array.isArray(item[field.key]) ? item[field.key].join(', ') : item[field.key] || ''}
                    onChange={(e) => updateItem(index, field.key, e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="Feature 1, Feature 2, Feature 3"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                ) : (
                  <input
                    type="text"
                    value={item[field.key] || ''}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Pricing Tier Editor
function PricingEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const pricingData = data || {
    creators: {
      basic: { title: 'Basic Editing', price: '$15-$25', priceNote: '/Per minute', description: [], features: [], cta: 'Start Basic Plan', discount: null },
      standard: { title: 'Standard Editing', price: '$25-$45', priceNote: '/Per minute', description: [], features: [], cta: 'Start Standard Plan', discount: 'Most Popular' },
      premium: { title: 'Premium Package', price: '$50-$80', priceNote: '/Per minute', description: [], features: [], cta: 'Start Premium Plan', discount: 'Best Value' },
    },
    agencies: {
      basic: { title: 'Starter Agency', price: '$300+', priceNote: '/Per project', description: [], features: [], cta: 'Contact for Starter', discount: null },
      standard: { title: 'Agency Growth', price: '$500+', priceNote: '/Per project', description: [], features: [], cta: 'Contact for Growth', discount: 'Most Popular' },
      premium: { title: 'Enterprise', price: 'Custom', priceNote: 'pricing', description: [], features: [], cta: 'Contact for Enterprise', discount: 'Best Value' },
    },
  };

  const [activeTab, setActiveTab] = useState<'creators' | 'agencies'>('creators');
  const [activeTier, setActiveTier] = useState<'basic' | 'standard' | 'premium'>('standard');
  const tier = pricingData[activeTab]?.[activeTier] || {};

  const updateTier = (key: string, value: any) => {
    const updated = { ...pricingData };
    if (!updated[activeTab]) updated[activeTab] = {};
    updated[activeTab][activeTier] = { ...tier, [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['creators', 'agencies'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => { setActiveTab(tab); setActiveTier('standard'); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {tab === 'creators' ? 'Creators' : 'Agencies'}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(['basic', 'standard', 'premium'] as const).map(t => (
          <button key={t} type="button" onClick={() => setActiveTier(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${activeTier === t ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {activeTab} → {activeTier}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Plan Title</label>
            <input type="text" value={tier.title || ''} onChange={e => updateTier('title', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Badge/Discount</label>
            <input type="text" value={tier.discount || ''} onChange={e => updateTier('discount', e.target.value || null)} placeholder="e.g. Most Popular"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Price</label>
            <input type="text" value={tier.price || ''} onChange={e => updateTier('price', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Price Note</label>
            <input type="text" value={tier.priceNote || ''} onChange={e => updateTier('priceNote', e.target.value)} placeholder="/Per minute"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">CTA Button Text</label>
          <input type="text" value={tier.cta || ''} onChange={e => updateTier('cta', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Description Lines (one per line)</label>
          <textarea value={Array.isArray(tier.description) ? tier.description.join('\n') : ''} rows={3}
            onChange={e => updateTier('description', e.target.value.split('\n').filter(Boolean))}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Features (one per line)</label>
          <textarea value={Array.isArray(tier.features) ? tier.features.join('\n') : ''} rows={4}
            onChange={e => updateTier('features', e.target.value.split('\n').filter(Boolean))}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
        </div>
      </div>
    </div>
  );
}

// Simple Key-Value Editor for hero/featured_video
function SimpleFieldEditor({ data, schema, onChange }: { data: any; schema: typeof sectionContentSchema[string]; onChange: (data: any) => void }) {
  const d = data || {};
  const update = (key: string, value: string) => onChange({ ...d, [key]: value });

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">{schema.label}</h4>
      {schema.fields.map(field => (
        <div key={field.key} className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea value={d[field.key] || ''} onChange={e => update(field.key, e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
          ) : (
            <input type="text" value={d[field.key] || ''} onChange={e => update(field.key, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
          )}
        </div>
      ))}
    </div>
  );
}

// Section Preview Component
function SectionPreview({ sectionKey, title, subtitle, description, contentItems, schema }: { 
  sectionKey: string; title: string; subtitle: string; description: string; contentItems?: any; schema?: typeof sectionContentSchema[string];
}) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
          {sectionLabels[sectionKey] || sectionKey}
        </span>
        {title && <h3 className="text-base font-bold text-foreground leading-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-primary font-medium">{subtitle}</p>}
        {description && <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      
      {contentItems && Array.isArray(contentItems) && contentItems.length > 0 && schema && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{schema.label} Preview</p>
          {contentItems.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="p-2 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-foreground">{item.title || item.question || item.client_name || item.number || item.label || ''}</p>
              <p className="text-[10px] text-muted-foreground truncate">{item.description || item.answer || item.review || ''}</p>
            </div>
          ))}
          {contentItems.length > 3 && (
            <p className="text-[10px] text-muted-foreground text-center">+{contentItems.length - 3} more</p>
          )}
        </div>
      )}

      {contentItems && !Array.isArray(contentItems) && typeof contentItems === 'object' && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Content Preview</p>
          {Object.entries(contentItems).slice(0, 4).map(([key, val]: [string, any]) => (
            <div key={key} className="p-2 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-foreground capitalize">{key}</p>
              <p className="text-[10px] text-muted-foreground truncate">{typeof val === 'string' ? val : JSON.stringify(val).slice(0, 80)}</p>
            </div>
          ))}
        </div>
      )}
      
      {!title && !subtitle && !description && !contentItems && (
        <p className="text-xs text-muted-foreground/50 italic text-center">Start typing to see preview...</p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, logout, portfolioData, updatePortfolioItem, addPortfolioItem, deletePortfolioItem, uploadMedia } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [adminTab, setAdminTab] = useState<AdminTab>('portfolio');
  const [activeCategory, setActiveCategory] = useState<Category>('logos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', media_url: '', media_type: 'image' as MediaType, youtube_url: '', thumbnail_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Content management state
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [contentFormData, setContentFormData] = useState({ title: '', subtitle: '', description: '' });
  const [contentItems, setContentItems] = useState<any>(null);

  // Contacts state
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/admin');
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) { fetchSiteContent(); fetchContacts(); }
  }, [isAuthenticated]);

  const fetchSiteContent = async () => {
    const { data, error } = await supabase.from('site_content').select('*').order('section_key');
    if (!error && data) setSiteContent(data as SiteContent[]);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (!error && data) setContacts(data as ContactSubmission[]);
  };

  const openContentEditor = (content: SiteContent) => {
    setEditingContent(content);
    setContentFormData({ title: content.title || '', subtitle: content.subtitle || '', description: content.description || '' });
    const schema = sectionContentSchema[content.section_key];
    const listKey = contentListKey[content.section_key];
    
    if (schema?.type === 'pricing') {
      setContentItems(content.content?.pricing || null);
    } else if (schema?.type === 'hero' || schema?.type === 'simple') {
      setContentItems(content.content?.[listKey] || {});
    } else if (listKey && content.content?.[listKey]) {
      setContentItems([...content.content[listKey]]);
    } else {
      setContentItems(schema?.type === 'list' ? [] : null);
    }
  };

  const handleUpdateContent = async () => {
    if (!editingContent) return;
    setIsSaving(true);
    
    const listKey = contentListKey[editingContent.section_key];
    const schema = sectionContentSchema[editingContent.section_key];
    let contentData = editingContent.content || {};

    if (schema?.type === 'pricing' && contentItems) {
      contentData = { ...contentData, pricing: contentItems };
    } else if ((schema?.type === 'hero' || schema?.type === 'simple') && contentItems) {
      contentData = { ...contentData, [listKey]: contentItems };
    } else if (listKey && Array.isArray(contentItems) && contentItems.length > 0) {
      contentData = { ...contentData, [listKey]: contentItems };
    }

    const { error } = await supabase
      .from('site_content')
      .update({
        title: contentFormData.title || null,
        subtitle: contentFormData.subtitle || null,
        description: contentFormData.description || null,
        content: contentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingContent.id);

    if (error) {
      toast({ title: 'Update failed', variant: 'destructive' });
    } else {
      toast({ title: 'Content updated successfully' });
      fetchSiteContent();
      refreshSiteContent();
      setEditingContent(null);
    }
    setIsSaving(false);
  };

  const handleUpdateContactStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('contact_submissions').update({ status }).eq('id', id);
    if (!error) { toast({ title: `Status updated to ${status}` }); fetchContacts(); }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Delete this contact submission?')) {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
      if (!error) { toast({ title: 'Contact deleted' }); fetchContacts(); setSelectedContact(null); }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const handleLogout = () => { logout(); toast({ title: 'Logged out successfully' }); navigate('/admin'); };

  const openAddModal = () => {
    setEditingItem(null);
    const defaultMediaType = (activeCategory === 'shorts' || activeCategory === 'longvideos' || activeCategory === 'aivideos') ? 'youtube' : 'image';
    setFormData({ title: '', description: '', media_url: '', media_type: defaultMediaType, youtube_url: '', thumbnail_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description || '', media_url: item.media_url, media_type: item.media_type, youtube_url: item.youtube_url || '', thumbnail_url: item.thumbnail_url || '' });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadMedia(file, activeCategory);
      if (url) {
        setFormData((prev) => ({ ...prev, media_url: url, thumbnail_url: file.type.startsWith('video/') ? prev.thumbnail_url : url }));
        toast({ title: 'File uploaded successfully' });
      } else { toast({ title: 'Upload failed', variant: 'destructive' }); }
    } catch { toast({ title: 'Upload failed', variant: 'destructive' }); }
    finally { setIsUploading(false); }
  };

  const handleYouTubeUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, youtube_url: url }));
    const thumbnail = getYouTubeThumbnail(url);
    if (thumbnail) setFormData((prev) => ({ ...prev, youtube_url: url, thumbnail_url: thumbnail, media_url: thumbnail }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast({ title: 'Please enter a title', variant: 'destructive' }); return; }
    if (!formData.media_url.trim() && formData.media_type !== 'youtube') { toast({ title: 'Please upload or provide media', variant: 'destructive' }); return; }
    if (formData.media_type === 'youtube' && !formData.youtube_url.trim()) { toast({ title: 'Please enter a YouTube URL', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      let success = false;
      if (editingItem) {
        success = await updatePortfolioItem({ ...editingItem, title: formData.title, description: formData.description || null, media_url: formData.media_url, media_type: formData.media_type, youtube_url: formData.youtube_url || null, thumbnail_url: formData.thumbnail_url || null });
        toast({ title: success ? 'Project updated successfully' : 'Update failed', variant: success ? 'default' : 'destructive' });
      } else {
        success = await addPortfolioItem({ category: activeCategory, title: formData.title, description: formData.description || null, media_url: formData.media_url, media_type: formData.media_type, youtube_url: formData.youtube_url || null, thumbnail_url: formData.thumbnail_url || null });
        toast({ title: success ? 'Project added successfully' : 'Add failed', variant: success ? 'default' : 'destructive' });
      }
      if (success) { setIsModalOpen(false); setFormData({ title: '', description: '', media_url: '', media_type: 'image', youtube_url: '', thumbnail_url: '' }); }
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const success = await deletePortfolioItem(id);
      toast({ title: success ? 'Project deleted successfully' : 'Delete failed', variant: success ? 'default' : 'destructive' });
    }
  };

  const items = portfolioData[activeCategory];
  const CategoryIcon = categoryIcons[activeCategory];
  const sizeGuide = categorySizeGuides[activeCategory];

  // Determine what editor to show for the current content section
  const getContentEditorType = (sectionKey: string) => {
    return sectionContentSchema[sectionKey]?.type || 'none';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-foreground">
            SAM<span className="text-primary">-VISUALS</span>
            <span className="text-muted-foreground font-normal ml-2 hidden sm:inline">/ Admin</span>
          </h1>
          <div className="flex items-center gap-2 md:gap-3">
            <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Home className="w-4 h-4" /><span className="hidden sm:inline">View Site</span>
            </a>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Tab Nav */}
        <div className="flex gap-2 mb-6 border-b border-border pb-4 overflow-x-auto">
          {([
            { key: 'portfolio', label: 'Portfolio', icon: Image },
            { key: 'content', label: 'Site Content', icon: FileText },
            { key: 'contacts', label: 'Contacts', icon: Mail },
          ] as { key: AdminTab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setAdminTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                adminTab === key ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" />{label}
              {key === 'contacts' && contacts.filter(c => c.status === 'new').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-destructive text-destructive-foreground rounded-full">
                  {contacts.filter(c => c.status === 'new').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Portfolio Tab */}
        {adminTab === 'portfolio' && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {(Object.keys(categoryLabels) as Category[]).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      activeCategory === cat ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}>
                    <Icon className="w-4 h-4" />{categoryLabels[cat]}
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-primary-foreground/20' : 'bg-background'}`}>
                      {portfolioData[cat].length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-6 p-3 md:p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Recommended Size: {sizeGuide.width} × {sizeGuide.height}</p>
                <p className="text-xs text-muted-foreground mt-1">{sizeGuide.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CategoryIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{categoryLabels[activeCategory]}</h2>
              </div>
              <button onClick={openAddModal} className="btn-primary text-sm md:text-base"><Plus className="w-4 h-4 mr-2" />Add New</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-muted rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all">
                    <div className="aspect-square relative overflow-hidden">
                      <img src={item.thumbnail_url || item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {item.media_type === 'youtube' && (
                        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                          <Youtube className="w-3 h-3" />YT
                        </div>
                      )}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => openEditModal(item)} className="p-3 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 rounded-full bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <p className="font-medium text-foreground truncate text-sm md:text-base">{item.title}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 capitalize">{item.media_type}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {items.length === 0 && (
              <div className="text-center py-16">
                <CategoryIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No {categoryLabels[activeCategory].toLowerCase()} added yet</p>
                <button onClick={openAddModal} className="btn-primary mt-4"><Plus className="w-4 h-4 mr-2" />Add First Project</button>
              </div>
            )}
          </>
        )}

        {/* Site Content Tab */}
        {adminTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Site Content Management</h2>
            </div>
            <div className="grid gap-4">
              {siteContent.map((content) => {
                const schema = sectionContentSchema[content.section_key];
                const listKey = contentListKey[content.section_key];
                const itemCount = listKey && content.content?.[listKey] 
                  ? (Array.isArray(content.content[listKey]) ? content.content[listKey].length : 'configured')
                  : 0;

                return (
                  <div key={content.id} className="p-4 md:p-5 rounded-xl bg-muted border border-border hover:border-primary/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{sectionLabels[content.section_key] || content.section_key}</h3>
                          {schema && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                              {typeof itemCount === 'number' ? `${itemCount} ${schema.label.toLowerCase()}` : schema.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{content.title || '(No title)'}</p>
                        {content.subtitle && <p className="text-xs text-muted-foreground/70 truncate">"{content.subtitle}"</p>}
                        {content.description && <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{content.description}</p>}
                      </div>
                      <button onClick={() => openContentEditor(content)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm shrink-0">
                        <Pencil className="w-4 h-4" />Edit All
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {adminTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Contact Submissions</h2>
            </div>
            {contacts.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No contact submissions yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {contacts.map((contact) => (
                  <motion.div key={contact.id} layout
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedContact?.id === contact.id ? 'bg-primary/10 border-primary' : 'bg-muted border-border hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            contact.status === 'new' ? 'bg-destructive/20 text-destructive' :
                            contact.status === 'replied' ? 'bg-green-500/20 text-green-600' :
                            'bg-muted-foreground/20 text-muted-foreground'
                          }`}>{contact.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.service} • {contact.project || 'No project'}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {contact.email && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />{contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />{contact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(contact.created_at).toLocaleDateString()}</p>
                    </div>
                    <AnimatePresence>
                      {selectedContact?.id === contact.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-border overflow-hidden">
                          <p className="text-sm text-foreground mb-4 whitespace-pre-wrap">{contact.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={(e) => { e.stopPropagation(); handleUpdateContactStatus(contact.id, 'replied'); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 text-xs font-medium">
                              <Check className="w-3 h-3" />Replied
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleUpdateContactStatus(contact.id, 'pending'); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium">
                              <Clock className="w-3 h-3" />Pending
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleUpdateContactStatus(contact.id, 'archived'); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30 text-xs font-medium">
                              <Archive className="w-3 h-3" />Archive
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 text-xs font-medium ml-auto">
                              <Trash2 className="w-3 h-3" />Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">{editingItem ? 'Edit Project' : 'Add New Project'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="mb-5 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground"><strong className="text-foreground">Size:</strong> {sizeGuide.width} × {sizeGuide.height}</p>
                <p className="text-xs text-muted-foreground mt-1">{sizeGuide.description}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Project Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description..." rows={2} className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Media Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['image', 'video', 'youtube'] as MediaType[]).map((type) => (
                      <button key={type} type="button" onClick={() => setFormData((prev) => ({ ...prev, media_type: type }))}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.media_type === type ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                        }`}>
                        {type === 'image' && <Image className="w-4 h-4" />}
                        {type === 'video' && <Video className="w-4 h-4" />}
                        {type === 'youtube' && <Youtube className="w-4 h-4" />}
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {formData.media_type === 'youtube' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">YouTube URL *</label>
                    <div className="relative">
                      <input type="url" value={formData.youtube_url} onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 pl-10 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                    {formData.thumbnail_url && (
                      <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-2">Auto-generated thumbnail:</p>
                        <img src={formData.thumbnail_url} alt="YouTube thumbnail" className="w-full aspect-video object-cover rounded" />
                      </div>
                    )}
                  </div>
                )}
                {formData.media_type !== 'youtube' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Upload Media *</label>
                    <input ref={fileInputRef} type="file" accept={formData.media_type === 'image' ? 'image/*' : 'video/*'} onChange={handleFileUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                      {isUploading ? (<><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span>Uploading...</span></>) :
                        (<><Upload className="w-5 h-5" /><span>Click to upload {formData.media_type}</span></>)}
                    </button>
                    {formData.media_url && (
                      <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-2">Uploaded file:</p>
                        {formData.media_type === 'image' ? (
                          <img src={formData.media_url} alt="Uploaded" className="w-full max-h-40 object-contain rounded" />
                        ) : (
                          <video src={formData.media_url} className="w-full max-h-40 rounded" controls />
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 btn-primary disabled:opacity-50">
                    {isSaving ? (<><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />{editingItem ? 'Update' : 'Save'}</>)}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Edit Modal with Live Preview */}
      <AnimatePresence>
        {editingContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setEditingContent(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 w-full max-w-5xl border border-border shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Edit {sectionLabels[editingContent.section_key] || editingContent.section_key}</h3>
                <button onClick={() => setEditingContent(null)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form Side */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Title / Subtitle / Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Title</label>
                      <input type="text" value={contentFormData.title} onChange={(e) => setContentFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Section title" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Subtitle</label>
                      <input type="text" value={contentFormData.subtitle} onChange={(e) => setContentFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Section subtitle" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea value={contentFormData.description} onChange={(e) => setContentFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Section description" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm" />
                  </div>

                  {/* Content Items Editor - varies by section type */}
                  {editingContent && (() => {
                    const schema = sectionContentSchema[editingContent.section_key];
                    if (!schema) return null;
                    
                    if (schema.type === 'pricing') {
                      return (
                        <div className="border-t border-border pt-4">
                          <PricingEditor data={contentItems} onChange={setContentItems} />
                        </div>
                      );
                    }
                    
                    if (schema.type === 'hero' || schema.type === 'simple') {
                      return (
                        <div className="border-t border-border pt-4">
                          <SimpleFieldEditor data={contentItems} schema={schema} onChange={setContentItems} />
                        </div>
                      );
                    }
                    
                    if (schema.type === 'list') {
                      return (
                        <div className="border-t border-border pt-4">
                          <ContentListEditor
                            items={Array.isArray(contentItems) ? contentItems : []}
                            schema={schema}
                            onChange={setContentItems}
                          />
                        </div>
                      );
                    }
                    
                    return null;
                  })()}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setEditingContent(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm">Cancel</button>
                    <button onClick={handleUpdateContent} disabled={isSaving} className="flex-1 btn-primary disabled:opacity-50 text-sm">
                      {isSaving ? (<><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save All Changes</>)}
                    </button>
                  </div>
                </div>

                {/* Live Preview Side */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Live Preview</span>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4 min-h-[200px] sticky top-4">
                    <SectionPreview
                      sectionKey={editingContent.section_key}
                      title={contentFormData.title}
                      subtitle={contentFormData.subtitle}
                      description={contentFormData.description}
                      contentItems={contentItems}
                      schema={sectionContentSchema[editingContent.section_key]}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
