-- Sistema de estadísticas privadas: vistas, engagement, historial de precios
-- Owner-only: solo el dueño de la propiedad/agencia puede leer sus stats.

BEGIN;

-- =====================================================================
-- 1. Tablas de eventos crudos
-- =====================================================================

CREATE TABLE property_views (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  session_id      text NOT NULL,
  viewer_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referer         text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX property_views_property_created_idx
  ON property_views (property_id, created_at DESC);
CREATE INDEX property_views_created_idx
  ON property_views (created_at DESC);

CREATE TABLE real_estate_views (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id      text NOT NULL,
  viewer_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referer         text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX real_estate_views_owner_created_idx
  ON real_estate_views (real_estate_id, created_at DESC);
CREATE INDEX real_estate_views_created_idx
  ON real_estate_views (created_at DESC);

CREATE TABLE property_price_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sale_price    numeric,
  sale_currency text,
  rent_price    numeric,
  rent_currency text,
  changed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX property_price_history_property_changed_idx
  ON property_price_history (property_id, changed_at DESC);

-- =====================================================================
-- 2. Counters denormalizados
-- =====================================================================

ALTER TABLE properties
  ADD COLUMN views_count      integer NOT NULL DEFAULT 0,
  ADD COLUMN favorites_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN inquiries_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN chats_count      integer NOT NULL DEFAULT 0,
  ADD COLUMN last_viewed_at   timestamptz;

ALTER TABLE real_estates
  ADD COLUMN profile_views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN last_viewed_at      timestamptz;

-- =====================================================================
-- 3. Triggers de counters
-- =====================================================================

CREATE OR REPLACE FUNCTION bump_property_views_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE properties
     SET views_count   = views_count + 1,
         last_viewed_at = NEW.created_at
   WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_property_view_insert
AFTER INSERT ON property_views
FOR EACH ROW EXECUTE FUNCTION bump_property_views_count();

CREATE OR REPLACE FUNCTION bump_real_estate_views_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE real_estates
     SET profile_views_count = profile_views_count + 1,
         last_viewed_at      = NEW.created_at
   WHERE profile_id = NEW.real_estate_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_real_estate_view_insert
AFTER INSERT ON real_estate_views
FOR EACH ROW EXECUTE FUNCTION bump_real_estate_views_count();

CREATE OR REPLACE FUNCTION bump_property_favorites_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties SET favorites_count = favorites_count + 1
     WHERE id = NEW.property_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE properties SET favorites_count = GREATEST(favorites_count - 1, 0)
     WHERE id = OLD.property_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER on_favorite_insert
AFTER INSERT ON favorites
FOR EACH ROW EXECUTE FUNCTION bump_property_favorites_count();
CREATE TRIGGER on_favorite_delete
AFTER DELETE ON favorites
FOR EACH ROW EXECUTE FUNCTION bump_property_favorites_count();

CREATE OR REPLACE FUNCTION bump_property_inquiries_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE properties SET inquiries_count = inquiries_count + 1
   WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_inquiry_insert
AFTER INSERT ON inquiries
FOR EACH ROW EXECUTE FUNCTION bump_property_inquiries_count();

CREATE OR REPLACE FUNCTION bump_property_chats_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    UPDATE properties SET chats_count = chats_count + 1
     WHERE id = NEW.property_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_chat_thread_insert
AFTER INSERT ON chat_threads
FOR EACH ROW EXECUTE FUNCTION bump_property_chats_count();

-- =====================================================================
-- 4. Trigger de historial de precios
-- =====================================================================

CREATE OR REPLACE FUNCTION log_property_price_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.sale_price IS NOT NULL OR NEW.rent_price IS NOT NULL THEN
      INSERT INTO property_price_history
        (property_id, sale_price, sale_currency, rent_price, rent_currency)
      VALUES
        (NEW.id, NEW.sale_price, NEW.sale_currency, NEW.rent_price, NEW.rent_currency);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.sale_price    IS DISTINCT FROM NEW.sale_price
    OR OLD.rent_price    IS DISTINCT FROM NEW.rent_price
    OR OLD.sale_currency IS DISTINCT FROM NEW.sale_currency
    OR OLD.rent_currency IS DISTINCT FROM NEW.rent_currency THEN
      INSERT INTO property_price_history
        (property_id, sale_price, sale_currency, rent_price, rent_currency)
      VALUES
        (NEW.id, NEW.sale_price, NEW.sale_currency, NEW.rent_price, NEW.rent_currency);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER on_property_price_change
AFTER INSERT OR UPDATE OF sale_price, rent_price, sale_currency, rent_currency
ON properties
FOR EACH ROW EXECUTE FUNCTION log_property_price_change();

-- =====================================================================
-- 5. Backfill inicial
-- =====================================================================

UPDATE properties p SET
  favorites_count = COALESCE((SELECT count(*) FROM favorites    WHERE property_id = p.id), 0),
  inquiries_count = COALESCE((SELECT count(*) FROM inquiries    WHERE property_id = p.id), 0),
  chats_count     = COALESCE((SELECT count(*) FROM chat_threads WHERE property_id = p.id), 0);

INSERT INTO property_price_history
  (property_id, sale_price, sale_currency, rent_price, rent_currency, changed_at)
SELECT id, sale_price, sale_currency, rent_price, rent_currency, COALESCE(created_at, now())
  FROM properties
 WHERE sale_price IS NOT NULL OR rent_price IS NOT NULL;

-- =====================================================================
-- 6. RLS — solo SELECT owner-only. Los inserts pasan por service-role.
-- =====================================================================

ALTER TABLE property_views        ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_views     ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pv_select_owner" ON property_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
       WHERE p.id = property_views.property_id
         AND p.real_estate_id = auth.uid()
    )
  );

CREATE POLICY "rev_select_owner" ON real_estate_views FOR SELECT
  USING (real_estate_id = auth.uid());

CREATE POLICY "pph_select_owner" ON property_price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
       WHERE p.id = property_price_history.property_id
         AND p.real_estate_id = auth.uid()
    )
  );

COMMIT;
