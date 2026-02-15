import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, User, Briefcase, FileText, ArrowRight, Loader2, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const serviceOptions = [
  { value: 'logo', label: 'Logo Design' },
  { value: 'thumbnail', label: 'YouTube Thumbnail' },
  { value: 'poster', label: 'Poster Design' },
  { value: 'video', label: 'Video Editing' },
  { value: 'bundle', label: 'Complete Bundle' },
];

export const Contact = forwardRef<HTMLElement>((_, ref) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project: '',
    service: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.service || !formData.description.trim()) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      toast({ title: 'Please provide email or phone number', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const serviceName = serviceOptions.find((s) => s.value === formData.service)?.label || formData.service;

    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        project: formData.project.trim() || null,
        service: serviceName,
        description: formData.description.trim(),
      });

      if (error) throw error;

      toast({
        title: 'Inquiry submitted!',
        description: 'We\'ll get back to you within 24 hours.',
      });

      setFormData({ name: '', email: '', phone: '', project: '', service: '', description: '' });
    } catch (err) {
      console.error('Failed to submit:', err);
      toast({ title: 'Submission failed. Please try again.', variant: 'destructive' });
    }

    setIsSubmitting(false);
  };

  return (
    <section ref={ref} id="contact" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-8 md:p-12 rounded-3xl border border-border bg-muted overflow-hidden shadow-lg">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(43_74%_49%/0.3),transparent_70%)]" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="section-badge mb-4">Get Started</span>
                <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
                  Ready to <span className="text-gradient">Stand Out</span>?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Fill in the details below and we'll get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="w-4 h-4 text-primary" />
                    Your Name <span className="text-primary">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>

                {/* Email & Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="w-4 h-4 text-primary" />
                      Email <span className="text-primary">*</span>
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone <span className="text-primary">*</span>
                    </label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground -mt-3">* At least one contact method (email or phone) is required</p>

                {/* Project Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Project / Brand Name
                  </label>
                  <input type="text" name="project" value={formData.project} onChange={handleChange} placeholder="Your brand or project name"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    What do you need? <span className="text-primary">*</span>
                  </label>
                  <select name="service" value={formData.service} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="">Select a service...</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Tell us about your vision <span className="text-primary">*</span>
                  </label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    placeholder="Describe your project, style preferences, colors, or any inspiration you have..." rows={4} required
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
                </div>

                {/* Submit */}
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center group disabled:opacity-50">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

Contact.displayName = 'Contact';
