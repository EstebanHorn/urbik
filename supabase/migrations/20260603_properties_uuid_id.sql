-- Migrar properties.id de integer autoincrement a uuid
-- Preserva data existente y todas las FKs hacia properties

BEGIN;

-- 1. Nueva columna uuid en properties (genera uuid distinto por fila)
ALTER TABLE properties
  ADD COLUMN id_new uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX properties_id_new_idx ON properties(id_new);

-- 2. Columnas uuid en tablas dependientes + backfill via join
ALTER TABLE chat_threads ADD COLUMN property_id_new uuid;
UPDATE chat_threads ct
   SET property_id_new = p.id_new
  FROM properties p
 WHERE ct.property_id = p.id;

ALTER TABLE favorites ADD COLUMN property_id_new uuid;
UPDATE favorites f
   SET property_id_new = p.id_new
  FROM properties p
 WHERE f.property_id = p.id;

ALTER TABLE inquiries ADD COLUMN property_id_new uuid;
UPDATE inquiries i
   SET property_id_new = p.id_new
  FROM properties p
 WHERE i.property_id = p.id;

-- 3. Drop policies RLS que referencian property_id (las recreamos abajo)
DROP POLICY IF EXISTS "threads_insert" ON chat_threads;
DROP POLICY IF EXISTS "threads_select" ON chat_threads;

-- 4. Drop unique indexes conocidos de chat_threads sobre property_id
DROP INDEX IF EXISTS chat_threads_with_property_unique;
DROP INDEX IF EXISTS chat_threads_general_unique;

-- 5. Drop columnas viejas (CASCADE limpia FKs e índices restantes)
ALTER TABLE chat_threads DROP COLUMN property_id CASCADE;
ALTER TABLE chat_threads RENAME COLUMN property_id_new TO property_id;

ALTER TABLE favorites DROP COLUMN property_id CASCADE;
ALTER TABLE favorites RENAME COLUMN property_id_new TO property_id;
ALTER TABLE favorites ALTER COLUMN property_id SET NOT NULL;

ALTER TABLE inquiries DROP COLUMN property_id CASCADE;
ALTER TABLE inquiries RENAME COLUMN property_id_new TO property_id;
ALTER TABLE inquiries ALTER COLUMN property_id SET NOT NULL;

-- 6. Swap properties.id (int) por id_new (uuid)
ALTER TABLE properties DROP CONSTRAINT properties_pkey CASCADE;
ALTER TABLE properties DROP COLUMN id;
ALTER TABLE properties RENAME COLUMN id_new TO id;
ALTER TABLE properties ADD PRIMARY KEY (id);
ALTER TABLE properties ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 7. Recrear FKs hacia properties(id)
ALTER TABLE chat_threads
  ADD CONSTRAINT chat_threads_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE favorites
  ADD CONSTRAINT favorites_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE inquiries
  ADD CONSTRAINT inquiries_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- 8. Recrear unique indexes en chat_threads (versión property_id NOT NULL / NULL)
CREATE UNIQUE INDEX chat_threads_with_property_unique
  ON chat_threads (user_id, real_estate_id, property_id)
  WHERE property_id IS NOT NULL;

CREATE UNIQUE INDEX chat_threads_general_unique
  ON chat_threads (user_id, real_estate_id)
  WHERE property_id IS NULL;

-- 9. Recrear unique de favorites (un favorito por perfil+propiedad)
CREATE UNIQUE INDEX IF NOT EXISTS favorites_profile_property_unique
  ON favorites (profile_id, property_id);

-- 10. Recrear RLS policies en chat_threads
CREATE POLICY "threads_select" ON chat_threads FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = real_estate_id);

CREATE POLICY "threads_insert" ON chat_threads FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      property_id IS NULL
      OR EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = property_id AND p.real_estate_id = real_estate_id
      )
    )
  );

-- 11. Limpiar la sequence vieja del id integer
DROP SEQUENCE IF EXISTS properties_id_seq;

COMMIT;
