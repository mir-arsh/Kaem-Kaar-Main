-- Remove rating-related schema and triggers from Supabase

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_rating_inserted'
      AND tgrelid = 'public.ratings'::regclass
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS on_rating_inserted ON public.ratings';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.update_rating_avg();
DROP TABLE IF EXISTS public.ratings;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS rating_avg;
