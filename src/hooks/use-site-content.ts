import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteContent {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: any;
}

const cache: Record<string, SiteContent> = {};
let fetched = false;
let listeners: (() => void)[] = [];

async function fetchAll() {
  const { data } = await supabase.from('site_content').select('section_key, title, subtitle, description, content');
  if (data) {
    data.forEach((row) => {
      cache[row.section_key] = row as SiteContent;
    });
    fetched = true;
    listeners.forEach((fn) => fn());
  }
}

// Kick off fetch immediately on import
fetchAll();

export function refreshSiteContent() {
  fetched = false;
  fetchAll();
}

export function useSiteContent(sectionKey: string, defaults: { title?: string; subtitle?: string; description?: string; content?: any } = {}) {
  const [content, setContent] = useState<{ title: string; subtitle: string; description: string; content: any }>({
    title: cache[sectionKey]?.title || defaults.title || '',
    subtitle: cache[sectionKey]?.subtitle || defaults.subtitle || '',
    description: cache[sectionKey]?.description || defaults.description || '',
    content: cache[sectionKey]?.content || defaults.content || null,
  });

  useEffect(() => {
    const update = () => {
      const c = cache[sectionKey];
      if (c) {
        setContent({
          title: c.title || defaults.title || '',
          subtitle: c.subtitle || defaults.subtitle || '',
          description: c.description || defaults.description || '',
          content: c.content || defaults.content || null,
        });
      }
    };

    if (fetched) update();
    listeners.push(update);
    return () => { listeners = listeners.filter((fn) => fn !== update); };
  }, [sectionKey]);

  return content;
}
