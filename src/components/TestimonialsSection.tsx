import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContent } from '@/hooks/use-site-content';

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string | null;
  client_avatar: string | null;
  rating: number;
  review: string;
  display_order: number;
}

// Default testimonials for when database is empty
const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    client_name: 'Alex Johnson',
    client_role: 'YouTube Creator',
    client_avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    review:
      'Sam delivered incredible thumbnails that boosted my CTR by 40%. The attention to detail and quick turnaround exceeded all expectations.',
    display_order: 0,
  },
  {
    id: '2',
    client_name: 'Sarah Chen',
    client_role: 'Startup Founder',
    client_avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    review:
      'The logo design perfectly captures our brand essence. Professional, creative, and a joy to work with throughout the entire process.',
    display_order: 1,
  },
  {
    id: '3',
    client_name: 'Marcus Rivera',
    client_role: 'Content Creator',
    client_avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    review:
      "Best video editor I've worked with! The pacing, transitions, and color grading transformed my raw footage into cinematic content.",
    display_order: 2,
  },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { title, subtitle, description } = useSiteContent('testimonials', {
    title: 'Reviews that build trust',
    subtitle: 'Client Reviews',
    description: 'Clean communication, fast turnaround, and edits that feel premium on every platform.',
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setTestimonials(data as Testimonial[]);
      }
    };

    fetchTestimonials();
  }, []);

  // ... keep existing code (canNavigate, goToPrev, goToNext, auto-loop, current memo)

  const canNavigate = testimonials.length > 1;

  const goToPrev = () => {
    if (!canNavigate) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (!canNavigate) return;
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!canNavigate) return;
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => window.clearInterval(id);
  }, [canNavigate, testimonials.length]);

  const current = useMemo(() => testimonials[currentIndex], [testimonials, currentIndex]);

  return (
    <section id="testimonials" className="dark py-24 bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 opacity-60" style={{ background: 'var(--gradient-glow)' }} />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <span className="section-badge">{subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            {title}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative"
            >
              <div className="absolute -inset-0.5 rounded-3xl opacity-70 blur-sm" style={{ background: 'var(--gradient-gold)' }} />

              <div className="relative rounded-3xl border border-border bg-card p-8 md:p-12">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center shadow-[var(--shadow-gold)]">
                    <Quote className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="text-center pt-6"
                  >
                    <div className="flex justify-center gap-1.5 mb-7">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < current.rating
                              ? 'w-5 h-5 text-primary fill-primary'
                              : 'w-5 h-5 text-muted-foreground'
                          }
                        />
                      ))}
                    </div>

                    <p className="text-lg md:text-xl leading-relaxed mb-10 text-foreground/90">
                      &ldquo;{current.review}&rdquo;
                    </p>

                    <div className="w-16 h-px mx-auto mb-8 bg-border" />

                    <div className="flex items-center justify-center gap-4">
                      {current.client_avatar ? (
                        <img
                          src={current.client_avatar}
                          alt={current.client_name}
                          className="w-14 h-14 rounded-full object-cover border border-border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center text-primary font-bold text-xl">
                          {current.client_name.charAt(0)}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{current.client_name}</p>
                        {current.client_role && (
                          <p className="text-sm text-muted-foreground">{current.client_role}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {canNavigate && (
                  <>
                    <button
                      onClick={goToPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 hover:bg-background border border-border flex items-center justify-center transition-colors"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 hover:bg-background border border-border flex items-center justify-center transition-colors"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>

            {canNavigate && (
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

