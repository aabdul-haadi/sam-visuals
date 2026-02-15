import { motion } from "framer-motion";
import { useSiteContent } from '@/hooks/use-site-content';

function toEmbedUrl(youtubeUrl: string) {
  try {
    // Accepts: watch?v=, youtu.be/, embed/, shorts/
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const p of patterns) {
      const m = youtubeUrl.match(p);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch {
    // ignore
  }
  return youtubeUrl; // fallback: assume already an embed URL
}

export function FeaturedVideoSection({
  youtubeUrl,
  title: propTitle = "Featured Video",
  subtitle: propSubtitle = "A quick look at our editing quality and storytelling.",
}: {
  youtubeUrl: string;
  title?: string;
  subtitle?: string;
}) {
  const cms = useSiteContent('featured_video', {
    title: propTitle,
    description: propSubtitle,
  });
  const title = cms.title || propTitle;
  const subtitle = cms.description || propSubtitle;
  const embedUrl = toEmbedUrl(youtubeUrl);

  return (
    <section aria-label="Featured video" className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          <span className="section-badge">Featured</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)]"
        >
          <div className="relative w-full aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={embedUrl}
              title={title}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
