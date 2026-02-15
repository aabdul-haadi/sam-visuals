import { useState, memo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Wand2, Zap } from 'lucide-react';
import { PortfolioModal } from './PortfolioModal';
import { useSiteContent } from '@/hooks/use-site-content';

interface AIVideoItem {
  id: number | string;
  image?: string;
  media_url?: string;
  title: string;
  media_type?: 'image' | 'video' | 'youtube';
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  description?: string | null;
}

const AIVideoCard = memo(({
  item,
  aspectClass,
  onClick,
}: {
  item: AIVideoItem;
  aspectClass: string;
  onClick: () => void;
}) => {
  const imageUrl = item.thumbnail_url || item.media_url || item.image || '';

  return (
    <div className="group flex-shrink-0 cursor-pointer" onClick={onClick}>
      <div className={`relative ${aspectClass} overflow-hidden rounded-2xl border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.08)]`}>
        <img src={imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" draggable={false} />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_24px_hsl(var(--primary)/0.4)]">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 z-20">
          <p className="text-xs sm:text-sm font-medium text-white">{item.title}</p>
          {item.description && <p className="text-[10px] sm:text-xs text-white/70 mt-1 line-clamp-2">{item.description}</p>}
        </div>

        {/* AI Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-semibold bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-[0_0_12px_hsl(var(--primary)/0.3)]">
            <Wand2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />AI
          </span>
        </div>

        {/* Glow border on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/40 transition-colors duration-300 z-10 pointer-events-none" />
      </div>
    </div>
  );
});

AIVideoCard.displayName = 'AIVideoCard';

function AIMarquee({
  items,
  aspectClass,
  cardWidth,
  onItemClick,
}: {
  items: AIVideoItem[];
  aspectClass: string;
  cardWidth: string;
  onItemClick: (index: number) => void;
}) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const duplicatedItems = [...items, ...items, ...items];

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setIsPaused(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    if (marqueeRef.current) setScrollLeft(marqueeRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !marqueeRef.current) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    marqueeRef.current.scrollLeft = scrollLeft - (clientX - startX) * 2;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 1000);
  };

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || isPaused) return;
    const handleScroll = () => {
      const itemSetWidth = marquee.scrollWidth / 3;
      if (marquee.scrollLeft >= itemSetWidth * 2) marquee.scrollLeft = itemSetWidth;
      else if (marquee.scrollLeft <= 0) marquee.scrollLeft = itemSetWidth;
    };
    marquee.scrollLeft = marquee.scrollWidth / 3;
    marquee.addEventListener('scroll', handleScroll);
    return () => marquee.removeEventListener('scroll', handleScroll);
  }, [isPaused, items.length]);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || isPaused || items.length === 0) return;
    let animationId: number;
    const animate = () => {
      if (marquee && !isPaused) {
        marquee.scrollLeft += 0.5;
        const itemSetWidth = marquee.scrollWidth / 3;
        if (marquee.scrollLeft >= itemSetWidth * 2) marquee.scrollLeft = itemSetWidth;
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      ref={marqueeRef}
      className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
      style={{ scrollBehavior: 'auto' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => !isDragging && setIsPaused(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      {duplicatedItems.map((item, index) => (
        <div key={`${item.id}-${index}`} className={`flex-shrink-0 ${cardWidth}`}>
          <AIVideoCard
            item={item}
            aspectClass={aspectClass}
            onClick={() => onItemClick(index % items.length)}
          />
        </div>
      ))}
    </div>
  );
}

export function AIVideosSection({ items }: { items: AIVideoItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cms = useSiteContent('ai_videos', {
    title: 'AI-Powered Video Creations',
    subtitle: 'AI Videos',
    description: 'Next-gen AI-generated videos that push the boundaries of creativity and storytelling.',
  });

  const displaySize = cms.content?.display_size || 'reel';

  const aspectClasses: Record<string, string> = {
    reel: 'aspect-[9/16]',
    video: 'aspect-video',
  };

  const cardWidths: Record<string, string> = {
    reel: 'w-[150px] sm:w-[180px] md:w-[220px]',
    video: 'w-[260px] sm:w-[320px] md:w-[400px]',
  };

  const openModal = useCallback((index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);
  const goToPrevItem = useCallback(() => setSelectedIndex((prev) => Math.max(0, prev - 1)), []);
  const goToNextItem = useCallback(() => setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1)), [items.length]);

  const currentItem = items[selectedIndex];
  const currentPreviewImage = currentItem?.thumbnail_url || currentItem?.media_url || currentItem?.image || '';

  if (items.length === 0) return null;

  return (
    <section id="ai-videos" className="py-10 sm:py-14 md:py-20 relative overflow-hidden">
      {/* Dark cinematic background */}
      <div className="absolute inset-0 bg-foreground" />
      
      {/* Animated glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[50%] sm:w-[40%] aspect-square rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)' }}
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] sm:w-[40%] aspect-square rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 70%)' }}
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-14"
        >
          {/* Animated badge */}
          <motion.div
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-primary/50 text-primary bg-primary/10 backdrop-blur-sm mb-4 sm:mb-6"
            animate={{ 
              boxShadow: [
                '0 0 0 0 hsl(var(--primary)/0), 0 0 0 0 hsl(var(--primary)/0)',
                '0 0 20px 4px hsl(var(--primary)/0.2), 0 0 60px 12px hsl(var(--primary)/0.05)',
                '0 0 0 0 hsl(var(--primary)/0), 0 0 0 0 hsl(var(--primary)/0)',
              ] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {cms.subtitle}
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.div>

          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-background leading-tight">
            {cms.title}
          </h2>
          <p className="text-background/60 max-w-lg sm:max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
            {cms.description}
          </p>

          {/* Decorative line */}
          <motion.div
            className="mx-auto mt-4 sm:mt-6 h-px w-16 sm:w-24"
            style={{ background: 'var(--gradient-gold)' }}
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>
      </div>

      {/* Full-width Marquee */}
      <div className="w-full px-3 sm:px-4 relative z-10">
        <AIMarquee
          items={items}
          aspectClass={aspectClasses[displaySize] || aspectClasses.reel}
          cardWidth={cardWidths[displaySize] || cardWidths.reel}
          onItemClick={openModal}
        />
      </div>

      {/* Bottom fade line */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          className="mx-auto mt-6 sm:mt-10 flex items-center justify-center gap-2 sm:gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-px flex-1 max-w-[60px] sm:max-w-[100px] bg-gradient-to-r from-transparent to-primary/30" />
          <span className="text-[10px] sm:text-xs text-primary/60 font-medium tracking-widest uppercase">Powered by AI</span>
          <div className="h-px flex-1 max-w-[60px] sm:max-w-[100px] bg-gradient-to-l from-transparent to-primary/30" />
        </motion.div>
      </div>

      {/* Modal */}
      <PortfolioModal
        isOpen={modalOpen}
        onClose={closeModal}
        image={currentPreviewImage}
        title={currentItem?.title || ''}
        mediaType={currentItem?.media_type || 'video'}
        mediaUrl={currentItem?.media_url}
        youtubeUrl={currentItem?.youtube_url || undefined}
        onPrev={goToPrevItem}
        onNext={goToNextItem}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < items.length - 1}
      />
    </section>
  );
}
