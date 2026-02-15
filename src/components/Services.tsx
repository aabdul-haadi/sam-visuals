import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSiteContent } from '@/hooks/use-site-content';

import logoIcon from '@/assets/service-icons/logo-design.png';
import thumbnailsIcon from '@/assets/service-icons/thumbnails.png';
import posterIcon from '@/assets/service-icons/poster.png';
import videoEditingIcon from '@/assets/service-icons/video-editing.png';

const defaultServices = [
  {
    title: 'Logo Design',
    description: 'Brand identities that feel premium, memorable, and instantly recognizable.',
    features: ['Custom concepts', 'Unlimited revisions', 'All file formats'],
  },
  {
    title: 'YouTube Thumbnails',
    description: 'Click-worthy thumbnails designed to improve CTR and get more views.',
    features: ['High-CTR layouts', 'Fast delivery', 'Brand consistency'],
  },
  {
    title: 'Posters & Graphics',
    description: 'Eye-catching designs for events, promos, social media, and campaigns.',
    features: ['Print + digital', 'On-brand visuals', 'Multiple sizes'],
  },
  {
    title: 'Video Editing',
    description: 'Clean edits with pacing, transitions, color, and sound that keep viewers watching.',
    features: ['Reels/Shorts', 'YouTube videos', 'Captions + effects'],
  },
];

const iconMap = [logoIcon, thumbnailsIcon, posterIcon, videoEditingIcon];

export function Services() {
  const { title, subtitle, description, content } = useSiteContent('services', {
    title: 'Creative Services',
    subtitle: 'Explore our creative services',
    description: 'We create scroll-stopping visuals and edits that help creators and brands grow.',
    content: { services: defaultServices },
  });

  const services = content?.services || defaultServices;

  return (
    <section id="services" className="py-12 md:py-16 relative">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12">
          <span className="section-badge mb-4">Services</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-3">
            {subtitle || 'Explore our'} {!subtitle && <span className="text-gradient">creative services</span>}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">{description}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service: any, index: number) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl border border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <img src={iconMap[index % iconMap.length]} alt="" className="w-7 h-7 object-contain" loading="lazy" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              <ul className="space-y-2">
                {(service.features || []).map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,hsl(43_74%_49%/0.1),transparent_70%)]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
