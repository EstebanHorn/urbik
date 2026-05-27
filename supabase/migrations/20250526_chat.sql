-- Chat threads: one per (user, real_estate, property)
CREATE TABLE chat_threads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  real_estate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id    integer NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, real_estate_id, property_id)
);

-- Chat messages
CREATE TABLE chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at    timestamptz
);

-- Indexes
CREATE INDEX ON chat_threads (user_id, last_message_at DESC);
CREATE INDEX ON chat_threads (real_estate_id, last_message_at DESC);
CREATE INDEX ON chat_messages (thread_id, created_at ASC);

-- RLS
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "threads_select" ON chat_threads FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = real_estate_id);

CREATE POLICY "threads_insert" ON chat_threads FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id AND p.real_estate_id = real_estate_id
    )
  );

CREATE POLICY "messages_select" ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads t WHERE t.id = thread_id
      AND (t.user_id = auth.uid() OR t.real_estate_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert" ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_threads t WHERE t.id = thread_id
      AND (t.user_id = auth.uid() OR t.real_estate_id = auth.uid())
    )
  );

CREATE POLICY "messages_update_read" ON chat_messages FOR UPDATE
  USING (
    sender_id <> auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_threads t WHERE t.id = thread_id
      AND (t.user_id = auth.uid() OR t.real_estate_id = auth.uid())
    )
  )
  WITH CHECK (read_at IS NOT NULL);

-- Trigger: keep last_message_at fresh
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE chat_threads SET last_message_at = NOW() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_thread_last_message();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
