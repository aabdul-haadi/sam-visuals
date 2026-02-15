-- Add description column to portfolio_items
ALTER TABLE public.portfolio_items 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on portfolio_items for service role" ON public.portfolio_items;
DROP POLICY IF EXISTS "Allow all operations on testimonials for service role" ON public.testimonials;

-- Create proper RLS policies for portfolio_items using service role authentication
-- For admin operations, we'll use authenticated session check
CREATE POLICY "Admins can insert portfolio items" 
ON public.portfolio_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  OR current_setting('role', true) = 'service_role'
);

CREATE POLICY "Admins can update portfolio items" 
ON public.portfolio_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  OR current_setting('role', true) = 'service_role'
);

CREATE POLICY "Admins can delete portfolio items" 
ON public.portfolio_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  OR current_setting('role', true) = 'service_role'
);

-- Create proper RLS policies for testimonials
CREATE POLICY "Admins can insert testimonials" 
ON public.testimonials 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  OR current_setting('role', true) = 'service_role'
);

CREATE POLICY "Admins can update testimonials" 
ON public.testimonials 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  OR current_setting('role', true) = 'service_role'
);

CREATE POLICY "Admins can delete testimonials" 
ON public.testimonials 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  OR current_setting('role', true) = 'service_role'
);