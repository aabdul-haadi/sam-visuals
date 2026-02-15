ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;