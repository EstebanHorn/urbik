-- Sistema de reportes (AGENCY, PROPERTY, REVIEW, PARCEL) + notificaciones a inmobiliarias
-- target_id se guarda como text porque PARCEL referencia properties.id (uuid) igual que el resto,
-- pero mantenemos text para permitir flexibilidad futura (ej: chat messages u otros recursos).

CREATE TABLE reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type    text NOT NULL CHECK (target_type IN ('AGENCY','PROPERTY','REVIEW','PARCEL')),
  target_id      text NOT NULL,
  reporter_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason         text NOT NULL CHECK (reason IN ('SPAM','FRAUD','OFFENSIVE','INCORRECT_INFO','DUPLICATE','OTHER')),
  comment        text CHECK (comment IS NULL OR char_length(comment) <= 1000),
  status         text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','RESOLVED','DISMISSED')),
  admin_action   text CHECK (admin_action IS NULL OR admin_action IN ('DELETED','UNLINKED','DISMISSED')),
  admin_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON reports (status, created_at DESC);
CREATE INDEX ON reports (target_type, target_id);
CREATE INDEX ON reports (reporter_id);

-- Un usuario no puede tener dos reportes PENDING activos sobre el mismo objeto
CREATE UNIQUE INDEX reports_unique_active
  ON reports (reporter_id, target_type, target_id)
  WHERE status = 'PENDING';

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Toda la lectura/escritura va por API routes con createAdminClient (service role).
-- Igual definimos policies mínimas por si en el futuro se usa client directo.
CREATE POLICY "reports_insert_authenticated" ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_own_or_admin" ON reports FOR SELECT
  USING (
    reporter_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
  );

CREATE POLICY "reports_update_admin" ON reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'));


-- ---------------------------------------------------------------------------
-- Notificaciones: avisos al destinatario (típicamente la inmobiliaria afectada
-- cuando el admin actúa sobre un reporte). Mismo formato/estados que inquiries
-- para poder unificarlas en el panel "Notificaciones" del dashboard.
-- ---------------------------------------------------------------------------

CREATE TABLE notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          text NOT NULL DEFAULT 'REPORT_ACTION' CHECK (type IN ('REPORT_ACTION')),
  title         text NOT NULL,
  body          text NOT NULL,
  related_type  text CHECK (related_type IS NULL OR related_type IN ('AGENCY','PROPERTY','REVIEW','PARCEL')),
  related_id    text,
  status        text NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD','READ')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON notifications (recipient_id, created_at DESC);
CREATE INDEX ON notifications (recipient_id, status);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());
