import { useState, memo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { PortfolioModal } from './PortfolioModal';

interface PortfolioItem {
  id: number | string;
  image?: string;
  media_url?: string;
  title: string;
  media_type?: 'image' | 'video' | 'youtube';
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  description?: string | null;
}

interface PortfolioSectionProps {
  id: string;
  badge: string;
  title: string;
  description: string;
  items: PortfolioItem[];
  aspectRatio?: 'square' | 'video' | 'portrait' | 'reel';
}

const PortfolioCard = memo(({
  item,
  aspectClass,
  isVideo,
  onClick,
}: {
  item: PortfolioItem;
  aspectClass: string;
  isVideo: boolean;
  onClick: () => void;
}) => {
  const imageUrl = item.thumbnail_url || item.media_url || item.image || '';

  return (
    <div
      className="portfolio-card group flex-shrink-0 cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative ${aspectClass} overflow-hidden rounded-xl`}>
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        )}
        {/* Hover overlay with title and description */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          <p className="text-sm font-medium text-white">{item.title}</p>
          {item.description && (
            <p className="text-xs text-white/70 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
});

PortfolioCard.displayName = 'PortfolioCard';

// Infinite Marquee Component
function InfiniteMarquee({
  items,
  aspectClass,
  cardWidth,
  onItemClick,
}: {
  items: PortfolioItem[];
  aspectClass: string;
  cardWidth: string;
  onItemClick: (index: number) => void;
}) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  // Handle touch/mouse drag
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setIsPaused(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    if (marqueeRef.current) {
      setScrollLeft(marqueeRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !marqueeRef.current) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const walk = (clientX - startX) * 2;
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Resume after a short delay
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Reset scroll position for seamless loop
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || isPaused) return;

    const handleScroll = () => {
      const itemSetWidth = marquee.scrollWidth / 3;
      if (marquee.scrollLeft >= itemSetWidth * 2) {
        marquee.scrollLeft = itemSetWidth;
      } else if (marquee.scrollLeft <= 0) {
        marquee.scrollLeft = itemSetWidth;
      }
    };

    // Set initial scroll to middle set
    marquee.scrollLeft = marquee.scrollWidth / 3;

    marquee.addEventListener('scroll', handleScroll);
    return () => marquee.removeEventListener('scroll', handleScroll);
  }, [isPaused, items.length]);

  // Auto-scroll animation
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || isPaused || items.length === 0) return;

    let animationId: number;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      if (marquee && !isPaused) {
        marquee.scrollLeft += speed;
        const itemSetWidth = marquee.scrollWidth / 3;
        if (marquee.scrollLeft >= itemSetWidth * 2) {
          marquee.scrollLeft = itemSetWidth;
        }
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
      className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
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
          <PortfolioCard
            item={item}
            aspectClass={aspectClass}
            isVideo={item.media_type === 'video' || item.media_type === 'youtube'}
            onClick={() => onItemClick(index % items.length)}
          />
        </div>
      ))}
    </div>
  );
}

export function PortfolioSection({
  id,
  badge,
  title,
  description,
  items,
  aspectRatio = 'square',
}: PortfolioSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    reel: 'aspect-[9/16]',
  };

  // Card widths for different aspect ratios - responsive
  // Logo and Poster now same size as Long Videos (video aspect ratio)
  const cardWidths = {
    square: 'w-[320px] sm:w-[400px]',
    video: 'w-[320px] sm:w-[400px]',
    portrait: 'w-[320px] sm:w-[400px]',
    reel: 'w-[180px] sm:w-[220px]',
  };

  const openModal = useCallback((index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const goToPrevItem = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToNextItem = useCallback(() => {
    setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
  }, [items.length]);

  const currentItem = items[selectedIndex];
  const currentPreviewImage =
    currentItem?.thumbnail_url || currentItem?.media_url || currentItem?.image || '';

  // Don't render section if no items
  if (items.length === 0) return null;

  return (
    <section id={id} className="py-10 md:py-14 relative overflow-hidden">
      {/* Section Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(43_74%_49%/0.15),transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <span className="section-badge mb-3">{badge}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-3 text-foreground">{title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">{description}</p>
        </motion.div>
      </div>

      {/* Full-width Marquee Slider */}
      <div className="w-full px-4">
        <InfiniteMarquee
          items={items}
          aspectClass={aspectClasses[aspectRatio]}
          cardWidth={cardWidths[aspectRatio]}
          onItemClick={openModal}
        />
      </div>

      {/* Modal */}
      <PortfolioModal
        isOpen={modalOpen}
        onClose={closeModal}
        image={currentPreviewImage}
        title={currentItem?.title || ''}
        mediaType={currentItem?.media_type || 'image'}
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
