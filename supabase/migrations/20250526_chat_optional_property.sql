-- Allow threads without a specific property (general agency inquiries)
ALTER TABLE chat_threads ALTER COLUMN property_id DROP NOT NULL;

-- Drop the old unique constraint that doesn't handle NULL properly
ALTER TABLE chat_threads DROP CONSTRAINT chat_threads_user_id_real_estate_id_property_id_key;

-- Unique index for threads WITH a property
CREATE UNIQUE INDEX chat_threads_with_property_unique
  ON chat_threads (user_id, real_estate_id, property_id)
  WHERE property_id IS NOT NULL;

-- Unique index for general threads (no property)
CREATE UNIQUE INDEX chat_threads_general_unique
  ON chat_threads (user_id, real_estate_id)
  WHERE property_id IS NULL;

-- Update insert policy to allow null property_id
DROP POLICY IF EXISTS "threads_insert" ON chat_threads;
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
