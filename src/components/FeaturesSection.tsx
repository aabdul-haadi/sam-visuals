import { motion } from 'framer-motion';
import { Video, FolderKanban, Film, BarChart3, Lightbulb, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSiteContent } from '@/hooks/use-site-content';

const defaultFeatures = [
  { title: 'Video Editing', description: 'Professional video editing with smooth transitions, cinematic effects, and advanced color grading.' },
  { title: 'Project Management', description: 'Efficient workflow management with clear task assignment, timelines, and progress tracking.' },
  { title: 'Video Production', description: 'Custom video production tailored to match your brand identity and creative vision.' },
  { title: 'Client Reporting', description: 'Detailed performance insights and analytics to keep clients informed and confident.' },
  { title: 'Content Strategy', description: 'Data-driven content planning designed to increase engagement and deliver measurable results.' },
  { title: 'Social Media Management', description: 'Scheduling and managing video content across multiple social media platforms with consistency.' },
];

const featureIcons = [Video, FolderKanban, Film, BarChart3, Lightbulb, Share2];
const featureGradients = [
  { gradient: 'from-pink-500/20 to-purple-500/20', iconBg: 'from-pink-500/30 to-purple-500/30' },
  { gradient: 'from-blue-500/20 to-cyan-500/20', iconBg: 'from-blue-500/30 to-cyan-500/30' },
  { gradient: 'from-amber-500/20 to-orange-500/20', iconBg: 'from-amber-500/30 to-orange-500/30' },
  { gradient: 'from-green-500/20 to-emerald-500/20', iconBg: 'from-green-500/30 to-emerald-500/30' },
  { gradient: 'from-yellow-500/20 to-amber-500/20', iconBg: 'from-yellow-500/30 to-amber-500/30' },
  { gradient: 'from-violet-500/20 to-purple-500/20', iconBg: 'from-violet-500/30 to-purple-500/30' },
];

export function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { title, description, content } = useSiteContent('features', {
    title: 'What Makes Us Stand Out',
    description: 'We combine creativity with strategy to deliver exceptional results for every project.',
    content: { features: defaultFeatures },
  });

  const features = (content?.features || defaultFeatures).map((f: any, i: number) => ({
    ...f,
    icon: featureIcons[i % featureIcons.length],
    ...featureGradients[i % featureGradients.length],
  }));

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % features.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + features.length) % features.length);

  return (
    <section id="features" className="py-12 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12">
          <motion.span initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="section-badge mb-4">Features</motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-3">{title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">{description}</p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden px-4">
            <motion.div className="flex" animate={{ x: `-${activeIndex * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              {features.map((feature: any, index: number) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="w-full flex-shrink-0 px-2">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className={`relative p-6 rounded-3xl bg-gradient-to-br ${feature.gradient} border border-border/50 backdrop-blur-sm`}>
                      <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                        <Icon className="w-8 h-8 text-foreground" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      <div className="absolute bottom-4 right-4 text-6xl font-bold text-foreground/5">0{index + 1}</div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <div className="flex gap-2">
              {features.map((_: any, index: number) => (
                <button key={index} onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'}`} />
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-5 max-w-6xl mx-auto">
          {features.map((feature: any, index: number) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }} whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative rounded-3xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                <div className="relative h-full p-6 border border-border/50 rounded-3xl backdrop-blur-sm bg-card/30">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="w-7 h-7 text-foreground" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  <div className="absolute bottom-4 right-4 text-7xl font-bold text-foreground/[0.03] group-hover:text-primary/[0.08] transition-colors">0{index + 1}</div>
                  <div className="absolute inset-0 rounded-3xl border-2 border-primary/0 group-hover:border-primary/20 transition-colors pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
