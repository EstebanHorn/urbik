-- ============================================================================
-- Bolsa de Conexiones — ajustes sobre el esquema EXISTENTE
-- ============================================================================
-- Las tablas clients, property_searches y search_responses YA EXISTEN en la DB.
-- Esta migración sólo agrega lo que falta para el módulo, de forma idempotente.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- property_searches: falta la columna area_unit (m² / hectáreas) que usa el form.
-- ---------------------------------------------------------------------------
ALTER TABLE public.property_searches
  ADD COLUMN IF NOT EXISTS area_unit text DEFAULT 'M2';

-- ---------------------------------------------------------------------------
-- search_responses: evitar que la misma propiedad se envíe dos veces a la
-- misma búsqueda (habilita el upsert onConflict del endpoint /api/responses).
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS search_responses_unique
  ON public.search_responses (search_id, property_id);

-- ---------------------------------------------------------------------------
-- notifications: ampliar los tipos permitidos para los eventos de la Bolsa.
-- La DB actual ya permite REPORT_ACTION y CONNECTION_REQUEST; sumamos los de
-- match y respuesta. related_type suma SEARCH para apuntar a una búsqueda.
-- ---------------------------------------------------------------------------
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY[
    'REPORT_ACTION'::text,
    'CONNECTION_REQUEST'::text,
    'SEARCH_MATCH'::text,
    'SEARCH_RESPONSE'::text
  ]));

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_related_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_related_type_check
  CHECK (related_type IS NULL OR related_type = ANY (ARRAY[
    'AGENCY'::text,
    'PROPERTY'::text,
    'REVIEW'::text,
    'PARCEL'::text,
    'SEARCH'::text
  ]));
