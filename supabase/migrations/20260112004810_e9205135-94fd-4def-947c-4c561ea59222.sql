-- Drop existing check constraint on category
ALTER TABLE portfolio_items DROP CONSTRAINT IF EXISTS portfolio_items_category_check;

-- Add new check constraint that includes shorts and longvideos
ALTER TABLE portfolio_items ADD CONSTRAINT portfolio_items_category_check 
  CHECK (category IN ('logos', 'thumbnails', 'posters', 'videos', 'shorts', 'longvideos'));