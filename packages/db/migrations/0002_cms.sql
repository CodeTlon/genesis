-- Genesis · CMS del sitio público (editable desde el panel). Un solo tenant en la demo.
INSERT INTO tenants (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Genesis Estética Integral')
  ON CONFLICT (id) DO NOTHING;

-- Imágenes subidas desde el panel (se procesan con sharp: se quita EXIF y se achican). Fase 1: object storage cifrado.
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants,
  filename text NOT NULL, mime text NOT NULL, bytes bytea NOT NULL,
  width int, height int, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE service_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants,
  slug text NOT NULL, name text NOT NULL, tagline text NOT NULL DEFAULT '', intro text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',               -- '/img/..' estático o '/media/<id>' subido
  faq jsonb NOT NULL DEFAULT '[]',
  position int NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug));

CREATE TABLE site_services (                    -- tratamientos que se ven en el sitio (distintos de `services`, los de la agenda)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants,
  group_id uuid NOT NULL REFERENCES service_groups ON DELETE CASCADE,
  slug text NOT NULL, name text NOT NULL, hook text NOT NULL DEFAULT '', summary text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '', sessions text NOT NULL DEFAULT '', price text NOT NULL DEFAULT '', notice text NOT NULL DEFAULT '',
  position int NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug));

CREATE TABLE gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants,
  image text NOT NULL, alt text NOT NULL,
  consent_public boolean NOT NULL DEFAULT false,  -- confirma que no hay personas o que hay consentimiento de uso público
  position int NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT false,
  CHECK (NOT published OR consent_public));       -- no se puede publicar sin confirmar el consentimiento

-- Bandeja de solicitudes del formulario "Pedir turno" del sitio
ALTER TABLE appointment_requests ADD COLUMN IF NOT EXISTS handled_at timestamptz;
CREATE INDEX appointment_requests_status ON appointment_requests (tenant_id, status, created_at DESC);
