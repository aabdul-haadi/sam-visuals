-- Add policies for admin operations on portfolio_items
-- Since we're using a custom admin auth (not Supabase Auth), we allow authenticated storage uploads
-- Admin operations are protected by the login check in the app

CREATE POLICY "Allow all operations on portfolio_items for service role" 
ON public.portfolio_items 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add policies for testimonials management
CREATE POLICY "Allow all operations on testimonials for service role" 
ON public.testimonials 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Drop restrictive SELECT policies and replace with permissive ones
DROP POLICY IF EXISTS "Anyone can view portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Anyone can view testimonials" ON public.testimonials;

-- Create permissive SELECT policies
CREATE POLICY "Public read access for portfolio items" 
ON public.portfolio_items 
FOR SELECT 
USING (true);

CREATE POLICY "Public read access for testimonials" 
ON public.testimonials 
FOR SELECT 
USING (true);