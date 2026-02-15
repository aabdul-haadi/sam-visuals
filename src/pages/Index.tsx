import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { FeaturedVideoSection } from '@/components/FeaturedVideoSection';
import { Services } from '@/components/Services';
import { FeaturesSection } from '@/components/FeaturesSection';
import { ProcessSection } from '@/components/ProcessSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AIVideosSection } from '@/components/AIVideosSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { Pricing } from '@/components/Pricing';
import { FAQSection } from '@/components/FAQSection';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { useAdmin } from '@/context/AdminContext';
import { portfolioData as defaultPortfolioData } from '@/data/portfolio';
import { useSiteContent } from '@/hooks/use-site-content';

const Index = () => {
  const { portfolioData } = useAdmin();

  const getItems = (category: 'logos' | 'posters' | 'shorts' | 'longvideos' | 'aivideos') => {
    const dbItems = portfolioData[category];
    if (dbItems && dbItems.length > 0) {
      return dbItems.map(item => ({
        id: item.id,
        image: item.thumbnail_url || item.media_url,
        title: item.title,
        media_type: item.media_type,
        youtube_url: item.youtube_url,
        thumbnail_url: item.thumbnail_url,
        media_url: item.media_url,
      }));
    }
    if (category === 'shorts' || category === 'longvideos' || category === 'aivideos') {
      return [];
    }
    return defaultPortfolioData[category] || [];
  };

  const logoCms = useSiteContent('portfolio_logos', { title: 'Logo Designs', subtitle: 'Design Work', description: 'Logos designed to do more than look good — they define your brand, build recognition, and create trust at first glance.' });
  const posterCms = useSiteContent('portfolio_posters', { title: 'Posters & Graphics', subtitle: 'Design Work', description: 'Eye-catching graphics and posters designed to grab attention instantly, communicate clearly, and leave a lasting visual impact.' });
  const shortsCms = useSiteContent('portfolio_shorts', { title: 'YouTube Shorts & Reels', subtitle: 'Editing Work', description: 'Short-form edits designed to stop the scroll, hook attention instantly, and keep viewers watching till the last frame.' });
  const longCms = useSiteContent('portfolio_longvideos', { title: 'Long-Form Videos', subtitle: 'Editing Work', description: 'Story-driven edits that hold attention, build credibility, and turn long videos into trust-building brand assets.' });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />

        <FeaturedVideoSection
          youtubeUrl="https://www.youtube.com/watch?v=GJ7unPa6flw"
          title="Featured Edit"
          subtitle="More than just an edit — this is how I turn raw footage into a brand-building visual experience."
        />

        {/* AI Videos - Special Featured Section (placed prominently) */}
        <AIVideosSection items={getItems('aivideos')} />

        <div id="work">
          <PortfolioSection id="logos" badge={logoCms.subtitle} title={logoCms.title} description={logoCms.description} items={getItems('logos')} aspectRatio="video" />
          <PortfolioSection id="posters" badge={posterCms.subtitle} title={posterCms.title} description={posterCms.description} items={getItems('posters')} aspectRatio="video" />
          <PortfolioSection id="shorts" badge={shortsCms.subtitle} title={shortsCms.title} description={shortsCms.description} items={getItems('shorts')} aspectRatio="reel" />
          <PortfolioSection id="longvideos" badge={longCms.subtitle} title={longCms.title} description={longCms.description} items={getItems('longvideos')} aspectRatio="video" />
        </div>

        <Services />
        <FeaturesSection />
        <ProcessSection />
        <TestimonialsSection />
        <Pricing />
        <FAQSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
