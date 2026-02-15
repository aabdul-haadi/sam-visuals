
ALTER TABLE public.portfolio_items DROP CONSTRAINT portfolio_items_category_check;
ALTER TABLE public.portfolio_items ADD CONSTRAINT portfolio_items_category_check CHECK (category = ANY (ARRAY['logos'::text, 'thumbnails'::text, 'posters'::text, 'videos'::text, 'shorts'::text, 'longvideos'::text, 'aivideos'::text]));
