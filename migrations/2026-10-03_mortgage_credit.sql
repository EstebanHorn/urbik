-- Ejecutar manualmente en Supabase SQL editor.

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS has_mortgage_credit boolean NOT NULL DEFAULT false;
