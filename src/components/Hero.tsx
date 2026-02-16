import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Image, Film, Palette, Type, Crop, Layers, Play } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useSiteContent } from '@/hooks/use-site-content';

// Tab configs for the creative screen
const screenTabs = [
  { id: 'editing', label: 'Video Edit', icon: Film },
  { id: 'photo', label: 'Photo', icon: Image },
  { id: 'poster', label: 'Poster', icon: Palette },
] as const;

type TabId = typeof screenTabs[number]['id'];

function VideoEditScreen() {
  return (
    <div className="h-full flex flex-col gap-2 p-2 md:p-3">
      <div className="flex-1 flex gap-2">
        <div className="flex-1 rounded-lg bg-muted/80 border border-border/30 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-4 h-4 md:w-5 md:h-5 text-primary fill-primary/40" />
            </motion.div>
          </div>
          <motion.div className="absolute bottom-1 left-1 right-1 flex gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="px-1.5 py-0.5 rounded bg-primary/20 text-[8px] text-primary font-medium">Color Grade</div>
            <div className="px-1.5 py-0.5 rounded bg-accent/20 text-[8px] text-primary/70 font-medium">SFX</div>
          </motion.div>
        </div>
        <div className="w-16 md:w-20 flex flex-col gap-1.5">
          {['Effects', 'Audio', 'Text'].map((item, i) => (
            <motion.div key={item} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }}
              className={`p-1.5 rounded-md text-[8px] font-medium text-center border ${i === 0 ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-muted/50 border-border/30 text-muted-foreground'}`}>
              {item}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {[
          { label: 'V1', width: '85%', color: 'bg-primary/40' },
          { label: 'A1', width: '70%', color: 'bg-accent/30' },
          { label: 'FX', width: '55%', color: 'bg-primary/20' },
        ].map((track, i) => (
          <div key={track.label} className="flex items-center gap-1">
            <span className="text-[7px] text-muted-foreground w-3 shrink-0">{track.label}</span>
            <div className="flex-1 h-3 rounded-sm bg-muted/40 relative overflow-hidden">
              <motion.div className={`absolute inset-y-0 left-0 rounded-sm ${track.color}`}
                initial={{ width: 0 }} animate={{ width: track.width }} transition={{ delay: 0.4 + i * 0.15, duration: 0.6, ease: 'easeOut' }} />
            </div>
          </div>
        ))}
        <motion.div className="relative h-0.5" animate={{ x: ['0%', '70%', '0%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
          <div className="w-0.5 h-4 bg-primary rounded-full absolute -top-3" />
        </motion.div>
      </div>
    </div>
  );
}

function PhotoEditScreen() {
  return (
    <div className="h-full flex gap-2 p-2 md:p-3">
      <div className="flex-1 rounded-lg bg-gradient-to-br from-muted/60 to-muted/30 border border-border/30 relative overflow-hidden">
        <div className="absolute inset-2 rounded-md bg-gradient-to-br from-primary/10 via-accent/5 to-muted/20 border border-border/20">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} />
        </div>
        <motion.div className="absolute top-4 left-4 right-8 bottom-8 border-2 border-dashed border-primary/50 rounded"
          animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}>
          {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-2 h-2 bg-primary rounded-sm`} />
          ))}
        </motion.div>
        <motion.div className="absolute" animate={{ x: [30, 80, 50, 30], y: [30, 60, 40, 30] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <Crop className="w-3 h-3 text-primary" />
        </motion.div>
      </div>
      <div className="w-20 md:w-24 flex flex-col gap-1.5">
        {[
          { label: 'Brightness', val: 72 },
          { label: 'Contrast', val: 58 },
          { label: 'Saturation', val: 85 },
          { label: 'Sharpness', val: 45 },
        ].map((adj, i) => (
          <motion.div key={adj.label} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 * i }} className="space-y-0.5">
            <div className="flex justify-between">
              <span className="text-[7px] text-muted-foreground">{adj.label}</span>
              <span className="text-[7px] text-primary font-medium">{adj.val}</span>
            </div>
            <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
              <motion.div className="h-full bg-primary/60 rounded-full" initial={{ width: 0 }} animate={{ width: `${adj.val}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PosterDesignScreen() {
  return (
    <div className="h-full flex gap-2 p-2 md:p-3">
      <div className="flex-1 rounded-lg bg-gradient-to-b from-muted/40 to-muted/60 border border-border/30 relative overflow-hidden flex flex-col items-center justify-center gap-2 p-3">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-full max-w-[100px] aspect-[3/4] rounded-md bg-gradient-to-b from-primary/20 via-muted/30 to-primary/10 border border-primary/20 shadow-lg relative overflow-hidden">
          <motion.div className="absolute top-2 left-2 right-2" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="h-1.5 w-2/3 bg-primary/40 rounded-sm mb-1" />
            <div className="h-1 w-1/2 bg-muted-foreground/20 rounded-sm" />
          </motion.div>
          <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-primary/30" />
          </motion.div>
          <motion.div className="absolute bottom-2 left-2 right-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <div className="h-1 w-full bg-muted-foreground/15 rounded-sm mb-0.5" />
            <div className="h-1 w-3/4 bg-muted-foreground/10 rounded-sm" />
          </motion.div>
        </motion.div>
      </div>
      <div className="w-14 md:w-16 flex flex-col gap-1.5">
        {[
          { icon: Type, label: 'Text' },
          { icon: Layers, label: 'Layers' },
          { icon: Palette, label: 'Colors' },
          { icon: Image, label: 'Assets' },
        ].map(({ icon: Icon, label }, i) => (
          <motion.div key={label} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 * i }}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-md border cursor-pointer transition-colors ${i === 0 ? 'bg-primary/15 border-primary/30' : 'bg-muted/30 border-border/30 hover:bg-muted/50'}`}>
            <Icon className={`w-3 h-3 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[7px] ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DesignScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('editing');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const idx = screenTabs.findIndex((t) => t.id === prev);
        return screenTabs[(idx + 1) % screenTabs.length].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -10 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      <div className="w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] bg-gradient-to-b from-muted/80 to-muted/40 rounded-2xl p-1.5 md:p-2 shadow-2xl border border-border/50 backdrop-blur-xl">
        <div className="bg-background rounded-xl overflow-hidden relative">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 border-b border-border/30">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive/60" />
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <div className="w-2 h-2 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-1.5">
              <div className="bg-background/60 rounded-md px-2 py-0.5 text-[8px] md:text-[9px] text-muted-foreground flex items-center gap-1">
                <span className="opacity-50">🔒</span> sam-visuals.studio
              </div>
            </div>
          </div>

          <div className="flex gap-0.5 px-2 py-1 bg-muted/20 border-b border-border/20">
            {screenTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-medium transition-all ${
                    activeTab === tab.id ? 'bg-primary/15 text-primary border border-primary/25' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-[140px] sm:h-[160px] md:h-[210px] lg:h-[250px] relative bg-background">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }} className="absolute inset-0">
                {activeTab === 'editing' && <VideoEditScreen />}
                {activeTab === 'photo' && <PhotoEditScreen />}
                {activeTab === 'poster' && <PosterDesignScreen />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1 bg-muted/30 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              {screenTabs.map((tab) => (
                <div key={tab.id} className={`w-1 h-1 rounded-full transition-colors ${activeTab === tab.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              ))}
            </div>
            <motion.span className="text-[8px] text-muted-foreground" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
              Live Preview
            </motion.span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-12 h-3 bg-gradient-to-b from-muted/60 to-muted/30 rounded-b-lg" />
      <div className="mx-auto w-20 h-1.5 bg-muted/25 rounded-full" />

      <motion.div className="absolute -top-3 -right-3 md:-top-5 md:-right-5" animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const { title, subtitle, description, content } = useSiteContent('hero', {
    title: 'Grow Your Brand',
    subtitle: 'Through Powerful Visuals',
    description: 'I create scroll-stopping motion graphics, videos, and social media content designed to grab attention, build trust, and turn viewers into loyal customers. From visuals to strategy — everything is crafted to strengthen your brand presence and accelerate growth.',
    content: { badge: 'Creative Brand Growth Partner', cta_primary: 'View My Work →', cta_secondary: 'Let\'s Grow Your Brand', tagline: 'Helping brands stand out, connect emotionally, and scale faster' },
  });

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden pt-20 md:pt-16">
      {/* Parallax Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div style={{ y: y3 }} className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.02, 0.98, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent rounded-full blur-3xl" />
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content - Desktop: Left & Right Layout, Mobile: Stacked with Screen between Content and CTA */}
      <motion.div style={{ scale }} className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
          {/* Left Column - Login Content (Desktop) / Top Content (Mobile) */}
          <div className="flex-1 w-full">
            {/* Content that appears above screen on mobile, left on desktop */}
            <div className="text-center md:text-left">
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ duration: 0.5, type: 'spring' }}
                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mx-auto md:mx-0"
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                </motion.div>
                <span className="text-[10px] md:text-xs font-medium text-primary">{content?.badge || 'Creative Brand Growth Partner'}</span>
              </motion.div>

              {/* Heading */}
              <div className="mt-4 md:mt-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  {title}{' '}
                  <span className="text-gradient">{subtitle}</span>
                </h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-md mx-auto md:mx-0"
                >
                  {description}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Right Column - Design Screen (Desktop) */}
          <div className="flex-1 hidden md:flex justify-end">
            <DesignScreen />
          </div>
        </div>

        {/* Mobile: Screen Animation (between content and CTA) */}
        <div className="md:hidden w-full flex justify-center my-6">
          <DesignScreen />
        </div>

        {/* Mobile: CTA Buttons and Tagline - with reduced padding and centered tagline */}
        <div className="flex flex-col items-center md:hidden w-full">
          {/* CTA Buttons - Reduced padding on mobile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto"
          >
            <motion.a 
              href="#work" 
              className="btn-primary group relative overflow-hidden text-sm w-full sm:w-auto justify-center px-4 py-2 sm:px-6 sm:py-3" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center">{content?.cta_primary || 'View My Work →'}</span>
            </motion.a>
            <motion.a 
              href="#contact"
              className="btn-secondary group text-sm w-full sm:w-auto justify-center px-4 py-2 sm:px-6 sm:py-3" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center">
                {content?.cta_secondary || 'Let\'s Grow Your Brand'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>
          </motion.div>
          
          {/* Tagline - Properly centered on mobile */}
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.7 }}
            className="text-xs text-muted-foreground mt-4 text-center w-full"
          >
            {content?.tagline || 'Helping brands stand out, connect emotionally, and scale faster'}
          </motion.p>
        </div>

        {/* Desktop: CTA Buttons and Tagline (in left column) */}
        <div className="hidden md:block flex-1 mt-6 md:mt-8 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center md:justify-start"
          >
            <motion.a 
              href="#work" 
              className="btn-primary group relative overflow-hidden text-sm w-full sm:w-auto justify-center" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center">{content?.cta_primary || 'View My Work →'}</span>
            </motion.a>
            <motion.a 
              href="#contact"
              className="btn-secondary group text-sm w-full sm:w-auto justify-center" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center">
                {content?.cta_secondary || 'Let\'s Grow Your Brand'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.7 }}
            className="text-xs md:text-sm text-muted-foreground mt-4"
          >
            {content?.tagline || 'Helping brands stand out, connect emotionally, and scale faster'}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}