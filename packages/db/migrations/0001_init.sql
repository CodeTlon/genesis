-- Genesis · esquema inicial (Fase 0, reusable en Fase 1). BORRADOR para Checkpoint 2.
-- tenant_id en todas las tablas. Cifrado de payload clínico (AES-256-GCM) y audit_log = Fase 1.
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS unaccent;      -- búsqueda tolerante a tildes
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- tolerancia a errores ("Gonzalez" = "González")

CREATE TABLE tenants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL);

CREATE TABLE areas (               -- Podología / Estética (multi-área)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  name text NOT NULL);

CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  full_name text NOT NULL, license_no text, area_id uuid REFERENCES areas);

CREATE TABLE resources (           -- camilla, cabina, equipo láser
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  name text NOT NULL);

CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  first_name text NOT NULL, last_name text NOT NULL, dni text, birth_date date,
  phone text, address text, emergency_contact text, insurance text,
  guardian_name text,              -- obligatorio si es menor de 18 (validar en app)
  alerts text[] NOT NULL DEFAULT '{}',   -- iconos de precaución: alergia, anticoagulante, diabetes…
  search_text text GENERATED ALWAYS AS
    (lower(unaccent(first_name || ' ' || last_name || ' ' || coalesce(dni,'') || ' ' || coalesce(phone,'')))) STORED,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX patients_search_trgm ON patients USING gin (search_text gin_trgm_ops);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  slug text NOT NULL, name text NOT NULL, area_id uuid REFERENCES areas,
  duration_min int NOT NULL, buffer_min int NOT NULL DEFAULT 0, followup_days int);  -- intervalo "próximo turno"

CREATE TABLE form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  code text NOT NULL, name text NOT NULL, status text NOT NULL DEFAULT 'draft');  -- 'draft' = propuesta a validar
CREATE TABLE form_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), template_id uuid NOT NULL REFERENCES form_templates,
  version int NOT NULL, schema jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, version));

CREATE TABLE clinical_entries (    -- append-only
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  patient_id uuid NOT NULL REFERENCES patients, professional_id uuid NOT NULL REFERENCES professionals,
  template_version_id uuid NOT NULL REFERENCES form_template_versions,
  payload jsonb NOT NULL,          -- Fase 1: cifrado AES-GCM
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','signed')),
  signed_at timestamptz, prev_hash text, hash text,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE clinical_addenda (    -- correcciones: autor, fecha, motivo
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entry_id uuid NOT NULL REFERENCES clinical_entries,
  author_id uuid NOT NULL REFERENCES professionals, reason text NOT NULL, payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now());

-- Inmutabilidad: una entrada firmada no se edita ni se borra (borradores sí).
CREATE FUNCTION forbid_signed_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'signed' THEN RAISE EXCEPTION 'Entrada firmada: no se puede borrar'; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'signed' THEN RAISE EXCEPTION 'Entrada firmada: corregir con adenda'; END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER clinical_entries_immutable BEFORE UPDATE OR DELETE ON clinical_entries
  FOR EACH ROW EXECUTE FUNCTION forbid_signed_change();

CREATE TABLE foot_markers (        -- mapa de pies estructurado
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entry_id uuid NOT NULL REFERENCES clinical_entries,
  side text NOT NULL CHECK (side IN ('left','right')), view text NOT NULL CHECK (view IN ('plantar','dorsal')),
  zone text NOT NULL, finding text NOT NULL, severity int CHECK (severity BETWEEN 1 AND 3), note text);

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  patient_id uuid REFERENCES patients, service_id uuid NOT NULL REFERENCES services,
  professional_id uuid NOT NULL REFERENCES professionals, resource_id uuid REFERENCES resources,
  during tstzrange NOT NULL,       -- zona America/Argentina/Cordoba en la capa de presentación
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','in_room','done','no_show','cancelled')),
  source text NOT NULL DEFAULT 'panel',   -- panel | web_request | whatsapp
  -- sin doble reserva por profesional (a nivel base de datos)
  EXCLUDE USING gist (professional_id WITH =, during WITH &&) WHERE (status NOT IN ('cancelled','no_show')),
  EXCLUDE USING gist (resource_id WITH =, during WITH &&) WHERE (resource_id IS NOT NULL AND status NOT IN ('cancelled','no_show')));

CREATE TABLE appointment_requests (     -- formulario "Pedir turno" del sitio: Inés confirma
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  name text NOT NULL, phone text NOT NULL, service_slug text, note text,
  status text NOT NULL DEFAULT 'new', created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE whatsapp_threads_demo (    -- solo simulación Fase 0; sin contenido clínico
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  patient_id uuid REFERENCES patients, messages jsonb NOT NULL DEFAULT '[]');

CREATE TABLE site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants,
  key text NOT NULL, value jsonb NOT NULL, UNIQUE (tenant_id, key));
