-- Ejecutar manualmente en Supabase SQL editor.

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS display_address text;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS province text;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS phone text;
