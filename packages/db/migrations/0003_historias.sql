-- Historias clínicas del panel (REQ-HC-012). Ids de texto para conservar los ids de la demo (p1, e1…).
-- Las tablas patients/clinical_entries de 0001 quedan sin uso (modelo uuid anterior); el panel usa hc_*.
-- Reusa forbid_signed_change() de 0001: una atención firmada no se edita ni se borra (se corrige con adenda).

CREATE TABLE hc_patients (
  id text PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants,
  first_name text NOT NULL, last_name text NOT NULL, dni text, birth_date date, phone text,
  address text, insurance text, guardian text,
  first_visit date, nationality text, sex text, height_cm numeric, weight_kg numeric, blood_group text,
  occupation text, other_activities text, emergency_name text, emergency_phone text,
  alerts text[] NOT NULL DEFAULT '{}',
  consent jsonb NOT NULL DEFAULT '{"data":"pendiente","imageClinical":"pendiente","imagePublic":"pendiente"}',
  uses_insoles boolean, medication text,
  search_text text GENERATED ALWAYS AS
    (lower(immutable_unaccent(first_name || ' ' || last_name || ' ' || coalesce(dni,'') || ' ' || coalesce(phone,'')))) STORED,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX hc_patients_search_trgm ON hc_patients USING gin (search_text gin_trgm_ops);

CREATE TABLE hc_entries (
  id text PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants,
  patient_id text NOT NULL REFERENCES hc_patients, template_code text NOT NULL, template_version int NOT NULL DEFAULT 1,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','signed')),
  author text NOT NULL, signed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX hc_entries_patient ON hc_entries (patient_id, created_at DESC);
CREATE TRIGGER hc_entries_immutable BEFORE UPDATE OR DELETE ON hc_entries
  FOR EACH ROW EXECUTE FUNCTION forbid_signed_change();

CREATE TABLE hc_addenda (
  id text PRIMARY KEY, entry_id text NOT NULL REFERENCES hc_entries,
  author text NOT NULL, reason text NOT NULL, text text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
