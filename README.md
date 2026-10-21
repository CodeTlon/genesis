# Genesis

Sistema de historias clínicas de podología para Genesis Estética Integral (Córdoba): pacientes, antecedentes, casos, evoluciones firmadas, mapa de pies y fotos clínicas privadas. **No hay sitio público**: la raíz redirige al panel.

**Estado:** proyecto real en construcción. **No cargar pacientes reales** hasta cumplir los puntos de `docs/restauraciones.md` (backup en B2 con simulacro fechado) y validar los campos con Inés.

## Stack
Next.js 16.4.2, React 19.3.1, TypeScript 6, Tailwind v4, PostgreSQL 17 (Docker) con migraciones SQL y Drizzle para consultas, Better Auth, Turborepo (npm workspaces). Decisiones en `docs/decisiones.md`.

## Estructura
`apps/web` (una app: el panel en `/panel`) · `packages/{db,ui,config}` · `scripts/` · `e2e/` (Playwright) · `docs/`

## Desarrollo local
```bash
cp .env.example .env            # completar BETTER_AUTH_SECRET y CLINICAL_DATA_ENCRYPTION_KEY (ver comentarios)
docker compose up -d db         # Postgres en el puerto 5433
npm install --legacy-peer-deps
npm run db:migrate
node scripts/crear-usuario.mjs "Nombre Apellido" correo@dominio.com admin
npm run dev -w @genesis/web
```
`npm run build` y luego `npm run test:e2e` (levanta la app en :3000 con secretos de prueba; necesita la base migrada).

## Ramas y entornos
`feature/<origen>-<tarea>` → PR a `dev` → `test` → `main`. Producción en Coolify con `docker-compose.coolify.yml`; variables en `.env.example`.

## Cambios
- **2026-10-21** — Se elimina el sitio público y el CMS (ADR-016): el producto es solo historias clínicas.
- **2026-10-21** — Pasa de demo a proyecto real: Postgres, login real, cifrado de campos clínicos, antecedentes, casos, mapa de pies v2, fotos privadas, consentimientos, auditoría, Docker/Coolify y backups.
