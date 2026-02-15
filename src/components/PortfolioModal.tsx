import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useCallback, useState } from 'react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Preview image used for loading state + cards */
  image: string;
  title: string;
  mediaType?: 'image' | 'video' | 'youtube';
  mediaUrl?: string;
  youtubeUrl?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

function getYouTubeEmbedUrl(url?: string) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  }

  return null;
}

export function PortfolioModal({
  isOpen,
  onClose,
  image,
  title,
  mediaType = 'image',
  mediaUrl,
  youtubeUrl,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PortfolioModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setImageLoaded(false);
      setIsZoomed(false);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
    setImageLoaded(false);
  }, [image]);

  const isImage = mediaType === 'image';
  const isYouTube = mediaType === 'youtube';
  const isVideo = mediaType === 'video';

  const embedUrl = isYouTube ? getYouTubeEmbedUrl(youtubeUrl) : null;
  const resolvedVideoUrl = isVideo ? mediaUrl : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/95 backdrop-blur-md"
          />

          {/* Top Controls */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            {isImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(!isZoomed);
                }}
                className="p-3 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors"
                title={isZoomed ? 'Zoom out' : 'Zoom in'}
              >
                {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation arrows */}
          {hasPrev && onPrev && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 md:left-8 z-50 p-4 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground transition-all shadow-lg hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}
          {hasNext && onNext && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 md:right-8 z-50 p-4 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground transition-all shadow-lg hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}

          {/* Media container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 flex flex-col items-center justify-center p-4 md:p-8 ${
              isImage ? (isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : ''
            }`}
            onClick={(e) => {
              if (!isImage) return;
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
          >
            {/* Loading skeleton (images only) */}
            {isImage && !imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {isImage && (
              <motion.img
                key={image}
                src={image}
                alt={title}
                onLoad={() => setImageLoaded(true)}
                animate={{ scale: isZoomed ? 1.5 : 1, opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className={`max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-all ${
                  imageLoaded ? '' : 'invisible'
                }`}
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              />
            )}

            {isVideo && resolvedVideoUrl && (
              <div className="w-[90vw] max-w-5xl">
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-background/5">
                  <video
                    src={resolvedVideoUrl}
                    controls
                    playsInline
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {isYouTube && embedUrl && (
              <div className="w-[90vw] max-w-5xl">
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-background/5">
                  <iframe
                    src={embedUrl}
                    title={title}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {isYouTube && !embedUrl && youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                onClick={(e) => e.stopPropagation()}
              >
                Open on YouTube
              </a>
            )}

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isImage ? (imageLoaded ? 1 : 0) : 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-center"
            >
              <p className="text-background font-semibold text-lg md:text-xl">{title}</p>
              {isImage && (
                <p className="text-background/50 text-sm mt-1">
                  Click image to {isZoomed ? 'zoom out' : 'zoom in'}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Bottom indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="text-background/50 text-sm">Use arrow keys to navigate</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
