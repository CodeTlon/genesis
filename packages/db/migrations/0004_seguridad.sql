-- Seguridad y fotos clínicas (REQ-SEG-003, SEG-005, FOT-001, FOT-002).
-- El contenido clínico (payload de atenciones, adendas, fotos) se guarda cifrado desde la app (AES-256-GCM, REQ-SEG-004):
-- la base solo ve texto/bytes ilegibles. La clave vive fuera del repo (GENESIS_DATA_KEY).

CREATE TABLE hc_users (
  id text PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants,
  username text NOT NULL UNIQUE, display_name text NOT NULL,
  password_hash text NOT NULL,          -- scrypt$sal$hash
  created_at timestamptz NOT NULL DEFAULT now());

-- Registro de accesos append-only: ni UPDATE, ni DELETE, ni TRUNCATE (REQ-SEG-005).
CREATE TABLE hc_audit (
  id bigserial PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants,
  at timestamptz NOT NULL DEFAULT now(),
  user_id text, user_name text NOT NULL,
  action text NOT NULL, patient_id text, entry_id text, detail text);
CREATE INDEX hc_audit_at ON hc_audit (at DESC);
CREATE INDEX hc_audit_patient ON hc_audit (patient_id, at DESC);
CREATE FUNCTION forbid_audit_change() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'El registro de accesos no se modifica ni se borra'; END $$ LANGUAGE plpgsql;
CREATE TRIGGER hc_audit_append_only BEFORE UPDATE OR DELETE ON hc_audit
  FOR EACH ROW EXECUTE FUNCTION forbid_audit_change();
CREATE TRIGGER hc_audit_no_truncate BEFORE TRUNCATE ON hc_audit
  FOR EACH STATEMENT EXECUTE FUNCTION forbid_audit_change();

-- Fotos clínicas: bytes cifrados en la base (entran en el mismo backup, nunca en una carpeta pública).
CREATE TABLE hc_photos (
  id text PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants,
  patient_id text NOT NULL REFERENCES hc_patients, entry_id text REFERENCES hc_entries,
  kind text NOT NULL CHECK (kind IN ('primera_consulta','evolucion')),
  mime text NOT NULL, bytes bytea NOT NULL, note text, author text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX hc_photos_patient ON hc_photos (patient_id, created_at);

-- La base también exige el consentimiento de imagen clínica vigente (REQ-FOT-002), no solo la app.
CREATE FUNCTION require_image_consent() RETURNS trigger AS $$
BEGIN
  IF (SELECT consent->>'imageClinical' FROM hc_patients WHERE id = NEW.patient_id) IS DISTINCT FROM 'vigente' THEN
    RAISE EXCEPTION 'Falta el consentimiento de imagen clínica vigente';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER hc_photos_consent BEFORE INSERT ON hc_photos
  FOR EACH ROW EXECUTE FUNCTION require_image_consent();
