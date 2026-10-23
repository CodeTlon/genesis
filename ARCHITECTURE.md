# Arquitectura

Una app Next.js (App Router) en `apps/web`; el panel vive en `/panel` y la raíz redirige. Postgres 17 con migraciones SQL (`packages/db/migrations`, fuente de verdad) y Drizzle para consultas.

## Capas del panel (`apps/web/src/panel`)
- `lib/actions.ts`: Server Actions (sesión + zod + auditoría). `lib/repo.ts`: datos; cifra y descifra los campos clínicos (`crypto.ts`). `lib/auth-server.ts`: `requireUser`, `audit`.
- `components/`: UI cliente. `tabs.tsx` (pestañas por URL), `editable.tsx` (lectura/edición), `toast.tsx`, `forms.tsx`, `foot-map.tsx`, `attention-form.tsx`, `patient-search.tsx`, `back-link.tsx`.
- Rutas: `app/(panel)/panel/(app)/pacientes/**` (lista, ficha, caso, atención, historia imprimible). Fotos privadas por `app/panel-media/[photoId]` y `app/api/clinico/fotos`.

## Diseño
Tokens en `packages/config/tokens.css` (marca, estados semánticos, movimiento). Solo CSS para animaciones; `prefers-reduced-motion` respetado. Ver ADR-018.

## Despliegue
`Dockerfile` (standalone, usuario no root) + `docker-compose.coolify.yml`. El entrypoint migra antes de arrancar. Ver README.
