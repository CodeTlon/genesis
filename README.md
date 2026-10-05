# Genesis

Sitio web y sistema interno de gestión (pacientes, historia clínica, agenda) para Genesis Estética Integral, Córdoba.

**Estado:** Fase 0 — demo con datos 100 % ficticios.

## Stack
Next.js 15.5.25, TypeScript, Tailwind v4, PostgreSQL 16 (`pg` con migraciones SQL), Turborepo (npm workspaces). Decisiones en `docs/decisiones.md`.

## Estructura
`apps/web` (una sola app: sitio público en `/` y panel interno en `/panel`) · `packages/{db,ui,config,content}` · `e2e/` (Playwright) · `docs/`

## Seguir en otra PC

**Requisitos:** Node 24, Git, Docker Desktop. Para clonar el repo privado, tener `gh auth login` (o credenciales de GitHub) con una cuenta de la organización CodeTlon.

```bash
git clone https://github.com/CodeTlon/genesis.git
cd genesis
git checkout dev          # se trabaja en `dev`; `main` queda con lo entregado
npm install

docker compose up -d db   # Postgres 16 en el puerto 5432
npm run db:migrate        # crea las tablas
npm run db:seed           # carga los grupos, servicios y galería iniciales
npm run db:verify         # (opcional) 14 comprobaciones de las garantías del esquema

npm run build
npm run start -w @genesis/web     # sitio → http://localhost:3000   ·   panel → http://localhost:3000/panel
```

- **Variables:** sin ninguna variable funciona en local. El panel no pide contraseña por defecto (botón «Entrar como…»); si definís `DEMO_PASSWORD` la exige (los tests usan `demo123`). Ver `.env.example`; los valores reales van en `.env.local` de cada app y nunca se commitean.
- **Tests E2E:** `npx playwright install chromium` (una sola vez) y `npm run test:e2e`. Necesitan `npm run build` previo y el puerto 3000 libre.
- **Datos:** el contenido del sitio (textos, servicios, galería, solicitudes de turno) vive en Postgres. Los pacientes, turnos y atenciones del panel son ficticios y están en memoria: se reinician al reiniciar el servidor.
- **Mapa del proyecto, reglas y errores conocidos:** `.claude/CLAUDE.md` y `.claude/ERRORES.md`. Guion de la demo: `docs/guion-demo.md`.

## Changelog
| Versión | Cambio |
|---|---|
| v0.1.0 | setup del repo y documentación de Checkpoints 1–2 |
| v0.2.0 | sitio público (5 grupos de servicios) y panel de la demo: Hoy, agenda, pacientes, fichas A/B/C, mapa de pies |
| v0.3.0 | sitio 100 % editable desde el panel (Sitio web): portada, servicios, nosotros, contacto, galería con consentimiento, aviso y SEO; bandeja de solicitudes de turno; migración 0002 |
| v0.3.1 | guía para clonar y seguir en otra PC |

## Licencia
Propietaria, todos los derechos reservados. Ver [LICENSE](LICENSE).

## Deploy en Vercel
Importar el repo con **Root Directory `apps/web`** (framework Next.js). No hace falta `vercel.json` ni ninguna variable de entorno. Detalle en `docs/decisiones.md` (ADR-011).
