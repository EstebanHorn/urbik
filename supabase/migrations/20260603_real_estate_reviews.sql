-- Reviews públicas de inmobiliarias: una review por (real_estate, user)

CREATE TABLE real_estate_reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating          int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         text NOT NULL CHECK (char_length(comment) BETWEEN 5 AND 1000),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (real_estate_id, user_id),
  CHECK (real_estate_id <> user_id)
);

CREATE INDEX ON real_estate_reviews (real_estate_id, created_at DESC);
CREATE INDEX ON real_estate_reviews (user_id);

ALTER TABLE real_estate_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public" ON real_estate_reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_own" ON real_estate_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid() AND real_estate_id <> auth.uid());

CREATE POLICY "reviews_update_own" ON real_estate_reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_delete_own" ON real_estate_reviews FOR DELETE
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION touch_review_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_update
BEFORE UPDATE ON real_estate_reviews
FOR EACH ROW EXECUTE FUNCTION touch_review_updated_at();
