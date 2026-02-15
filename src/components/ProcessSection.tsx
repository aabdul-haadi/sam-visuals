import { motion } from 'framer-motion';
import samPhoto from '@/assets/sam-photo.png';
import { useSiteContent } from '@/hooks/use-site-content';

const defaultSteps = [
  { number: '01', title: 'Submit Request', description: 'Share your video needs and project details to get started.' },
  { number: '02', title: 'Video Editing', description: 'Our team edits and you can request revisions to perfect it.' },
  { number: '03', title: 'Final Delivery', description: 'Receive the final video with all necessary adjustments.' },
];

export function ProcessSection() {
  const { title, content } = useSiteContent('process', {
    title: 'How our video editing service works for you',
    content: { steps: defaultSteps },
  });

  const steps = content?.steps || defaultSteps;

  return (
    <section id="process" className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-muted">
              <img src={samPhoto} alt="Sam - Video Editor" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="section-badge mb-4">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-12">{title}</h2>
            <div className="space-y-8">
              {steps.map((step: any, index: number) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 text-muted-foreground/50 text-sm font-medium pt-1">{step.number}</div>
                  <div className="flex-1 pb-8 border-b border-border last:border-0">
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
