import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '@/hooks/use-site-content';

const defaultFaqs = [
  { question: 'What services do you offer?', answer: 'We provide video editing, professional thumbnail designing, development, social media optimization, and more, tailored to meet your needs.' },
  { question: 'How long does it take to receive the final video?', answer: "Most standard projects are delivered within 24-48 hours. For larger or more complex videos, we'll let you know the estimated delivery time upfront. Need it faster? Let us know, rush delivery options are available." },
  { question: 'Do you offer revisions?', answer: 'We offer up to 3 revisions per video to make sure the final result aligns perfectly according to your vision.' },
  { question: 'What platforms do you create videos for?', answer: 'We specialize in creating videos for YouTube, Instagram, TikTok, Facebook, LinkedIn, and other social media platforms.' },
  { question: 'How do I share my footage with your team?', answer: "Once you place an order, we'll provide you with a secure upload link (like Google Drive, Dropbox, or WeTransfer). You can upload your raw footage, assets, and any notes or references directly there." },
  { question: 'How do I get started?', answer: 'Simply fill out the contact form with your project details, and our team will get in touch to discuss your video needs.' },
];

export const FAQSection = forwardRef<HTMLElement>((_, ref) => {
  const { title, subtitle, content } = useSiteContent('faq', {
    title: 'Frequently asked questions about us',
    subtitle: 'FAQ',
    content: { faqs: defaultFaqs },
  });

  const faqs = content?.faqs || defaultFaqs;

  return (
    <section ref={ref} id="faq" className="py-24 relative bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24 lg:self-start">
            <span className="section-badge mb-4">{subtitle}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-8">{title}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary font-medium">Have a question?<br />Let's discuss it now!</p>
              </div>
              <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-foreground text-background hover:opacity-90 transition-opacity">
                Book an appointment<ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <div className="space-y-0">
            {faqs.map((faq: any, index: number) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }} className="py-6 border-b border-border group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">{(index + 1).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = 'FAQSection';
