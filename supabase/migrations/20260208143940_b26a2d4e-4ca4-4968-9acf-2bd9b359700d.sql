-- Create a table for storing contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  project TEXT,
  service TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- Only admins can read/update/delete
CREATE POLICY "Admins can read contact submissions"
ON public.contact_submissions
FOR SELECT
USING (true);

CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
USING (true);

-- Create a table for site content management
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  content JSONB,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Public read access for site content"
ON public.site_content
FOR SELECT
USING (true);

-- Admins can manage site content
CREATE POLICY "Admins can update site content"
ON public.site_content
FOR UPDATE
USING (true);

CREATE POLICY "Admins can insert site content"
ON public.site_content
FOR INSERT
WITH CHECK (true);

-- Insert default content sections
INSERT INTO public.site_content (section_key, title, subtitle, description) VALUES
  ('hero', 'Elevate Your', 'Visual Identity', 'Stunning logos, thumbnails & videos that make your brand unforgettable.'),
  ('services', 'Creative Services', 'Explore our creative services', 'We create scroll-stopping visuals and edits that help creators and brands grow.'),
  ('features', 'What Makes Us Stand Out', NULL, 'We combine creativity with strategy to deliver exceptional results for every project.'),
  ('pricing', 'Pricing', 'Simple, transparent pricing', 'Choose the perfect plan for your creative needs.'),
  ('faq', 'FAQs', 'Frequently Asked Questions', 'Find answers to common questions about our services.'),
  ('contact', 'Get Started', 'Ready to Stand Out?', 'Fill in the details below and we''ll get back to you within 24 hours.'),
  ('footer', 'SAM-VISUALS', NULL, 'Crafting visual experiences that captivate and convert.');