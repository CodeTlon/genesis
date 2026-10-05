# Genesis — memoria del proyecto
Sitio público + panel interno (historias clínicas, agenda) para Genesis Estética Integral (Córdoba). **Fase 0: demo con datos ficticios.** Repo `CodeTlon/genesis`, ramas `main`/`dev`. Commits sin Co-Authored-By.

## Reglas propias (anulan defaults de la fábrica)
- **Sin marca CodeTlon** ni `<CodeTlonBadge />` (pedido del cliente final). Footer neutro.
- **Sin WhatsApp en ningún lado**: ni botón ni links en el sitio, y se eliminó el simulador del panel (pedido de Mateo).
- Datos 100 % ficticios; nada de fotos de pacientes en el repo (las 38 piezas están en `codetlon-cloud/client-assets/genesis…`, solo recortes cat. 3 en `apps/web/public/img`).
- Plantillas clínicas = **propuestas a validar** con la profesional. No inventar protocolos.
- Sin trackers, CDNs de terceros ni datos clínicos en localStorage.

## Stack y comandos
Next 15.5.25 + Tailwind v4 + Turborepo (npm) + Postgres 16 (`docker compose up -d db`, `npm run db:migrate`, `db:seed`, `db:verify`). `npm run build`, `npm run test:e2e` (requiere build; levanta web :3000 y panel :3001 con `DEMO_PASSWORD=demo123`). Decisiones en `docs/decisiones.md` (ADR-001…008).

## Mapa
- `apps/web`: sitio. Lee TODO el contenido de la base con `@genesis/db/content` (respaldo: `packages/content/src/defaults.ts`). ISR 60 s + `/api/revalidate`.
- `apps/panel`: demo. `/sitio/*` = CMS del sitio (Postgres; acciones en `src/lib/cms-actions.ts`, imágenes en `lib/cms.ts`). Clínico: `src/lib/store.ts` (datos en memoria), `templates.ts` (plantillas A/B/C), `components/{foot-map,template-form,agenda-board}.tsx`.
- `packages/config/tokens.css`: tokens de marca (único archivo). `packages/ui/vendor`: componentes de react-bits adaptados (HoldButton, Stepper).
- `docs/`: guion-demo, incidentes, imagenes, marca, decisiones.

## Pendiente
Pasar pacientes/agenda/atenciones del panel de memoria a Postgres (el SQL ya está verificado); Fase 1 (auth+2FA, cifrado, auditoría, backups); datos de Inés (matrículas, horarios, teléfono).
