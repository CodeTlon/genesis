-- Genesis · Fase real: auth (Better Auth), antecedentes, casos, fotos privadas, consentimientos y auditoría.
-- Extiende el esquema clínico de 0001 (clinical_entries / clinical_addenda), no lo duplica.
-- Reglas que no se tocan: entradas firmadas inmutables (trigger de 0001) y sin borrado físico de datos clínicos.

-- ───────── Better Auth (usuarios del panel) ─────────
CREATE TABLE "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  role text NOT NULL DEFAULT 'profesional' CHECK (role IN ('admin','profesional')),
  license_no text,                       -- matrícula (se muestra en el PDF de la historia)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE session (
  id text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ip_address text, user_agent text,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE);
CREATE INDEX session_user_idx ON session(user_id);
CREATE TABLE account (
  id text PRIMARY KEY,
  account_id text NOT NULL, provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token text, refresh_token text, id_token text,
  access_token_expires_at timestamptz, refresh_token_expires_at timestamptz,
  scope text, password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX account_user_idx ON account(user_id);
CREATE TABLE verification (
  id text PRIMARY KEY,
  identifier text NOT NULL, value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now());

-- ───────── Pacientes: datos básicos ampliados + borrado lógico ─────────
ALTER TABLE patients
  ADD COLUMN occupation text,
  ADD COLUMN deleted_at timestamptz,
  ADD COLUMN created_by text REFERENCES "user"(id);
-- Cobertura (obra social) ya existe como `insurance`; contacto de emergencia como `emergency_contact`.

-- ───────── Antecedentes (1 vigente por paciente, versionados) ─────────
CREATE TABLE patient_antecedentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  version int NOT NULL,
  flags jsonb NOT NULL DEFAULT '{}',     -- {diabetes:true, circulacion:true, anticoagulantes:false, ...}
  notes_enc text,                        -- texto libre cifrado (AES-256-GCM)
  created_by text NOT NULL REFERENCES "user"(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, version));

-- ───────── Casos / tratamientos ─────────
CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  title text NOT NULL,
  reason_enc text,                       -- motivo de consulta
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  conclusion_enc text,
  suggestions_enc text,
  created_by text NOT NULL REFERENCES "user"(id));
CREATE INDEX cases_patient_idx ON cases(patient_id, status);

-- ───────── Evoluciones (clinical_entries) colgadas de un caso, con autor = usuario ─────────
ALTER TABLE clinical_entries
  ALTER COLUMN professional_id DROP NOT NULL,
  ALTER COLUMN template_version_id DROP NOT NULL,
  ADD COLUMN case_id uuid REFERENCES cases(id),
  ADD COLUMN author_user_id text REFERENCES "user"(id),
  ADD COLUMN template_code text,
  ADD COLUMN template_version int NOT NULL DEFAULT 1,
  ADD COLUMN foot_type text CHECK (foot_type IN ('egipcio','griego','romano'));
CREATE INDEX clinical_entries_patient_idx ON clinical_entries(patient_id, created_at DESC);
CREATE INDEX clinical_entries_case_idx ON clinical_entries(case_id);

ALTER TABLE clinical_addenda
  ALTER COLUMN author_id DROP NOT NULL,
  ADD COLUMN author_user_id text REFERENCES "user"(id);

-- Las adendas también son inmutables.
CREATE FUNCTION forbid_addenda_change() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'Las adendas no se editan ni se borran'; END $$ LANGUAGE plpgsql;
CREATE TRIGGER clinical_addenda_immutable BEFORE UPDATE OR DELETE ON clinical_addenda
  FOR EACH ROW EXECUTE FUNCTION forbid_addenda_change();

-- Estado del marcador del mapa de pies (a tratar / tratado).
ALTER TABLE foot_markers ADD COLUMN state text NOT NULL DEFAULT 'a_tratar' CHECK (state IN ('a_tratar','tratado'));

-- ───────── Consentimientos ─────────
CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  kind text NOT NULL CHECK (kind IN ('tratamiento','fotos','datos')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  document_ref text,                     -- referencia al consentimiento firmado (papel / escaneo)
  created_by text NOT NULL REFERENCES "user"(id));
CREATE INDEX consents_patient_idx ON consents(patient_id, kind);

-- ───────── Fotos clínicas (el archivo vive en el volumen privado; acá solo metadatos) ─────────
CREATE TABLE clinical_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  case_id uuid REFERENCES cases(id),
  entry_id uuid REFERENCES clinical_entries(id),
  kind text NOT NULL CHECK (kind IN ('inicial','evolucion','final')),
  storage_key text NOT NULL,             -- uuid de archivo, NUNCA el nombre original
  thumb_key text,
  mime text NOT NULL DEFAULT 'image/webp',
  consent_id uuid NOT NULL REFERENCES consents(id),   -- sin consentimiento de fotos no se puede subir
  taken_at date,
  deleted_at timestamptz,
  created_by text NOT NULL REFERENCES "user"(id),
  created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX clinical_photos_case_idx ON clinical_photos(case_id) WHERE deleted_at IS NULL;
CREATE INDEX clinical_photos_patient_idx ON clinical_photos(patient_id) WHERE deleted_at IS NULL;

-- ───────── Auditoría de accesos y cambios (solo se agrega) ─────────
CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  user_id text,
  action text NOT NULL,                  -- view_patient, view_photo, sign_entry, export, login, ...
  entity text, entity_id text,
  ip text);
CREATE INDEX audit_log_entity_idx ON audit_log(entity, entity_id);
CREATE FUNCTION forbid_audit_change() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'El registro de auditoría no se edita ni se borra'; END $$ LANGUAGE plpgsql;
CREATE TRIGGER audit_log_immutable BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION forbid_audit_change();
