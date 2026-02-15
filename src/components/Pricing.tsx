import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Crown, Zap } from 'lucide-react';
import { useState } from 'react';
import { useSiteContent } from '@/hooks/use-site-content';

const pricingTabs = ['Creators', 'Agencies'] as const;

type PricingTier = 'basic' | 'standard' | 'premium';

interface TierData {
  title: string;
  icon: React.ReactNode;
  popular: boolean;
  description: string[];
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  discount?: string | null;
}

const defaultCreatorsTiers: Record<PricingTier, TierData> = {
  basic: {
    title: 'Basic Editing', icon: <Zap className="w-5 h-5" />, popular: false,
    description: ["Perfect for simple content that needs a quick polish.", "Ideal for vlogs, podcasts, and basic tutorials.", "Fast turnaround with essential edits."],
    price: '$15-$25', priceNote: '/Per minute',
    features: ['Min. 5-minute video length', 'Basic audio cleanup', 'Simple cuts and trimming', 'Basic transitions', '2 revision rounds', '3-5 day delivery'],
    cta: 'Start Basic Plan', discount: null,
  },
  standard: {
    title: 'Standard Editing', icon: <Sparkles className="w-5 h-5" />, popular: true,
    description: ["If you're a content creator, this plan is built for you.", "Work on a single video or order in bulk totally your choice.", "Check out our portfolio references before placing an order."],
    price: '$25-$45', priceNote: '/Per minute',
    features: ['Min. 10-minute video length', 'Pro audio editing', 'Motion graphics, SFX, transitions', 'Color grading & typography', 'Unlimited revisions', '1-2 Google Meet calls', 'Free Google Drive setup'],
    cta: 'Start Standard Plan', discount: 'Most Popular',
  },
  premium: {
    title: 'Premium Package', icon: <Crown className="w-5 h-5" />, popular: false,
    description: ["For creators who want the absolute best quality.", "Full creative direction and advanced effects.", "Priority support and fastest turnaround."],
    price: '$50-$80', priceNote: '/Per minute',
    features: ['Any video length', 'Advanced audio mastering', 'Custom motion graphics & VFX', 'Advanced color grading', 'Unlimited revisions', 'Dedicated editor', 'Priority 48hr delivery', 'Thumbnail + publishing included'],
    cta: 'Start Premium Plan', discount: 'Best Value',
  },
};

const defaultAgenciesTiers: Record<PricingTier, TierData> = {
  basic: {
    title: 'Starter Agency', icon: <Zap className="w-5 h-5" />, popular: false,
    description: ["Great for small agencies getting started.", "Perfect for occasional video projects.", "Flexible terms with no commitment."],
    price: '$300+', priceNote: '/Per project',
    features: ['Up to 5 videos/month', 'Standard editing quality', 'Basic motion graphics', '3 revision rounds', 'Email support', '5-7 day delivery'],
    cta: 'Contact for Starter', discount: null,
  },
  standard: {
    title: 'Agency Growth', icon: <Sparkles className="w-5 h-5" />, popular: true,
    description: ["Perfect for growing agencies with regular video needs.", "Priority support and dedicated project manager.", "Bulk pricing with flexible billing options."],
    price: '$500+', priceNote: '/Per project',
    features: ['Up to 15 videos/month', 'Premium editing quality', 'Advanced motion graphics & VFX', 'Unlimited revisions', 'Dedicated project manager', 'Priority support', '3-5 day delivery'],
    cta: 'Contact for Growth', discount: 'Most Popular',
  },
  premium: {
    title: 'Enterprise', icon: <Crown className="w-5 h-5" />, popular: false,
    description: ["For large agencies with high-volume needs.", "White-label solutions and custom workflows.", "24/7 priority support with SLA."],
    price: 'Custom', priceNote: 'pricing',
    features: ['Unlimited videos', 'Highest quality output', 'Custom VFX & animation', 'Unlimited revisions', 'Dedicated team', '24/7 priority support', '24-48hr delivery', 'White-label options'],
    cta: 'Contact for Enterprise', discount: 'Best Value',
  },
};

const tierIcons: Record<PricingTier, React.ReactNode> = {
  basic: <Zap className="w-4 h-4 md:w-5 md:h-5" />,
  standard: <Sparkles className="w-4 h-4 md:w-5 md:h-5" />,
  premium: <Crown className="w-4 h-4 md:w-5 md:h-5" />,
};

function mergeTiers(defaults: Record<PricingTier, TierData>, cms: any): Record<PricingTier, TierData> {
  if (!cms) return defaults;
  const result = { ...defaults };
  for (const tier of ['basic', 'standard', 'premium'] as PricingTier[]) {
    if (cms[tier]) {
      result[tier] = {
        ...defaults[tier],
        title: cms[tier].title || defaults[tier].title,
        price: cms[tier].price || defaults[tier].price,
        priceNote: cms[tier].priceNote || defaults[tier].priceNote,
        description: cms[tier].description?.length > 0 ? cms[tier].description : defaults[tier].description,
        features: cms[tier].features?.length > 0 ? cms[tier].features : defaults[tier].features,
        cta: cms[tier].cta || defaults[tier].cta,
        discount: cms[tier].discount !== undefined ? cms[tier].discount : defaults[tier].discount,
        icon: tierIcons[tier],
        popular: tier === 'standard',
      };
    }
  }
  return result;
}

export const Pricing = forwardRef<HTMLElement>((_, ref) => {
  const [activeTab, setActiveTab] = useState<typeof pricingTabs[number]>('Creators');
  const [activeTier, setActiveTier] = useState<PricingTier>('standard');
  
  const { title, subtitle, description, content } = useSiteContent('pricing', {
    title: 'Simple pricing plans for video editing services',
    subtitle: 'Pricing',
    description: 'Choose the perfect plan for your creative needs.',
  });

  const cmsPricing = content?.pricing;
  const creatorsTiers = mergeTiers(defaultCreatorsTiers, cmsPricing?.creators);
  const agenciesTiers = mergeTiers(defaultAgenciesTiers, cmsPricing?.agencies);

  const tiers = activeTab === 'Creators' ? creatorsTiers : agenciesTiers;
  const data = tiers[activeTier];

  return (
    <section ref={ref} id="pricing" className="py-12 md:py-24 relative bg-background">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-8 md:mb-12">
          <span className="section-badge mb-3 md:mb-4">{subtitle}</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-3 md:mt-4 mb-3 md:mb-4 leading-tight">{title}</h2>
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-8">
          <div className="inline-flex items-center gap-1 md:gap-2 p-1 rounded-full border border-border bg-card">
            {pricingTabs.map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setActiveTier('standard'); }}
                className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${activeTab === tab ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tier Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="flex items-center justify-center gap-1.5 md:gap-2 mb-6 md:mb-12">
          {(['basic', 'standard', 'premium'] as PricingTier[]).map((tier) => {
            const tierData = tiers[tier];
            return (
              <button key={tier} onClick={() => setActiveTier(tier)}
                className={`relative flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeTier === tier ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}>
                {tierData.icon}
                <span className="capitalize">{tier}</span>
                {tierData.discount && (
                  <span className={`absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold ${
                    tier === 'standard' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    {tier === 'standard' ? '★' : '✓'}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Pricing Card */}
        <motion.div key={`${activeTab}-${activeTier}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto">
          <div className="relative p-5 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl border border-border bg-card">
            {data.discount && (
              <div className="absolute top-4 right-4 md:top-8 md:right-8 lg:top-12 lg:right-12">
                <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold bg-primary text-primary-foreground flex items-center gap-1">
                  {data.icon}{data.discount}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              {/* Left: Info */}
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 text-primary">{data.icon}</div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold pr-16 md:pr-0">{data.title}</h3>
                </div>
                <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                  {data.description.map((line, i) => (
                    <p key={i} className="text-muted-foreground text-xs md:text-sm">{line}</p>
                  ))}
                </div>
                <div className="mb-5 md:mb-8">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-bold">{data.price}</span>
                  <span className="text-muted-foreground text-sm md:text-lg ml-1">{data.priceNote}</span>
                </div>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 w-full px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold btn-primary text-sm md:text-base">
                  {data.cta}<ArrowRight className="w-4 h-4" />
                </a>
              </div>
              {/* Right: Features */}
              <div className="space-y-3 md:space-y-4">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-xs md:text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

Pricing.displayName = 'Pricing';
