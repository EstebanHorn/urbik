-- ============================================================================
-- Borrado en cascada para la Bolsa de Conexiones
-- ============================================================================
-- Al eliminar un contacto (clients), se eliminan sus búsquedas publicadas
-- (property_searches) y, a su vez, las respuestas recibidas (search_responses).
-- client_id es NOT NULL, por eso usamos CASCADE en lugar de SET NULL.
-- ============================================================================

-- clients -> property_searches
ALTER TABLE public.property_searches
  DROP CONSTRAINT IF EXISTS property_searches_client_id_fkey;
ALTER TABLE public.property_searches
  ADD CONSTRAINT property_searches_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- property_searches -> search_responses
-- (también arregla el borrado directo de una búsqueda que tenga respuestas)
ALTER TABLE public.search_responses
  DROP CONSTRAINT IF EXISTS search_responses_search_id_fkey;
ALTER TABLE public.search_responses
  ADD CONSTRAINT search_responses_search_id_fkey
    FOREIGN KEY (search_id) REFERENCES public.property_searches(id) ON DELETE CASCADE;
