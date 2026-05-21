-- Add scheduled_date field to user_generations table to track when planeaciones are pinned to calendar
ALTER TABLE public.user_generations 
ADD COLUMN IF NOT EXISTS scheduled_date date;

-- Create an index on scheduled_date and user_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_generations_scheduled_date 
ON public.user_generations(user_id, scheduled_date);
