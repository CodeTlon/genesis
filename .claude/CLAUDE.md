# Genesis — memoria del proyecto
Sistema de historias clínicas de podología para Inés (Genesis Estética Integral, Córdoba). **Proyecto real, ya no es demo, y sin sitio público ni CMS** (el cliente quiere solo historias clínicas, ADR-016). Repo `CodeTlon/genesis`, ramas `feature/*` → `dev` → `test` → `main`. Commits sin Co-Authored-By.

## Reglas propias (anulan defaults de la fábrica)
- **Sin marca CodeTlon** ni `<CodeTlonBadge />` (pedido del cliente final).
- **Sin WhatsApp en ningún lado** (pedido de Mateo).
- **No cargar pacientes reales** hasta tener backup en B2 con simulacro de restauración fechado (`docs/restauraciones.md`) y los campos validados con Inés. Datos de prueba, siempre ficticios.
- Nunca subir al repo fotos de pacientes ni la ficha de papel de Inés (tiene datos de una paciente real).
- Plantillas clínicas = **propuestas a validar** con la profesional. No inventar protocolos.
- Sin trackers, CDNs de terceros ni datos clínicos en localStorage.
- `CLINICAL_DATA_ENCRYPTION_KEY` jamás en el repo ni en el backup de la base; si se pierde, los datos son irrecuperables.

## Stack y comandos
Next 16.4.2 + React 19.3.1 + Tailwind v4 + Better Auth + Drizzle (consultas) + Postgres 17, Turborepo (npm, instalar con `--legacy-peer-deps`). Postgres local en **:5433**. `npm run build`, `npm run test:e2e` (requiere build y base migrada; en la VPS usar `CHROMIUM_PATH=/opt/playwright/chromium-*/chrome-linux-arm64/chrome` y una base en el rango de puertos propio). Capturas: `CAPTURAS=1 npx playwright test capturas` -> `screenshots/`. Usuarios: `scripts/crear-usuario.mjs`. Decisiones en `docs/decisiones.md` (ADR-012…018).

## Mapa
- `apps/web/src/panel/lib`: `repo.ts` (datos, cifra y descifra), `actions.ts` (Server Actions: sesión + zod + auditoría), `crypto.ts`, `photos.ts`, `auth-server.ts` (`requireUser`, `audit`), `types.ts`, `templates.ts`.
- `panel/components`: `tabs.tsx` (pestañas por `?tab=`), `editable.tsx` (lectura/edición), `toast.tsx`, `back-link.tsx` (BackBar), `patient-search.tsx`; el mapa edita zonas en un `<dialog>` (hoja en móvil).
- `apps/web/src/app/(panel)/panel/(app)/pacientes/**`: lista, ficha, casos, evolución, historia imprimible. `app/panel-media/[photoId]` y `app/api/clinico/fotos`: fotos privadas.
- `packages/db`: `migrations/*.sql` (fuente de verdad) y `src/schema.ts` (Drizzle, **debe reflejar el SQL**).

- `app/(panel)/panel/(app)/inicio`: pantalla de inicio. `panel/components/form-validity.tsx` (errores de campo propios), `foot-shape.tsx` (silueta del login), `password-field.tsx` (ojo).

- `scripts/sembrar-prueba.ts`: datos ficticios con volumen (`SEMBRAR_DATOS_FICTICIOS=si CANTIDAD=250 npx tsx scripts/sembrar-prueba.ts`). `e2e/dispositivos.spec.ts` lo usa.

- Diseño: `docs/decisiones.md` ADR-022. De `codetlon-cloud/references/diseños` se tomó solo la idea (sin copiar código ni agregar dependencias) de kokonutui `action-search-bar`, `metric-card` y `lightbox-grid`. `ALERT_HINT` (frases de las alertas) es propuesta a validar con Inés. Búsqueda rápida: `/` o Ctrl+K.

## Specs (SDD)
Perfil **S2** (`sdd: v1`): `specs/<capacidad>/spec.md` con REQ-CAP-NNN, validador `npm run spec:lint` (corre en CI). Cada test E2E lleva `[REQ-XXX-NNN]` en el título. Un cambio de comportamiento abre un delta en `specs/changes/` antes de implementarse. Brecha abierta: REQ-SEG-005 (simulacro de restauración real).

## Pendiente
Validar con Inés antecedentes, lesiones y zonas del mapa; 2FA y rotación de clave de cifrado; simulacro de restauración contra B2 real; deploy en Coolify (`docker-compose.coolify.yml`); inscripción AAIP y consentimiento de fotos gestionado por fuera del sistema (ADR-019, texto revisado por una persona con matrícula).
