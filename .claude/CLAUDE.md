# Genesis — memoria del proyecto
Sistema de historias clínicas de podología para Inés (Genesis Estética Integral, Córdoba) + sitio público (apagado por defecto). **Proyecto real, ya no es demo.** Repo `CodeTlon/genesis`, ramas `feature/*` → `dev` → `test` → `main`. Commits sin Co-Authored-By.

## Reglas propias (anulan defaults de la fábrica)
- **Sin marca CodeTlon** ni `<CodeTlonBadge />` (pedido del cliente final). Footer neutro.
- **Sin WhatsApp en ningún lado** (pedido de Mateo).
- **No cargar pacientes reales** hasta tener backup en B2 con simulacro de restauración fechado (`docs/restauraciones.md`) y los campos validados con Inés. Datos de prueba, siempre ficticios.
- Nunca subir al repo fotos de pacientes ni la ficha de papel de Inés (tiene datos de una paciente real).
- Plantillas clínicas = **propuestas a validar** con la profesional. No inventar protocolos.
- Sin trackers, CDNs de terceros ni datos clínicos en localStorage.
- `CLINICAL_DATA_ENCRYPTION_KEY` jamás en el repo ni en el backup de la base; si se pierde, los datos son irrecuperables.

## Stack y comandos
Next 16.4.2 + React 19.3.1 + Tailwind v4 + Better Auth + Drizzle (consultas) + Postgres 17, Turborepo (npm, instalar con `--legacy-peer-deps`). Postgres local en **:5433**. `npm run build`, `npm run test:e2e` (requiere build y base migrada). Usuarios: `scripts/crear-usuario.mjs`. Decisiones en `docs/decisiones.md` (ADR-012…015).

## Mapa
- `apps/web/src/panel/lib`: `repo.ts` (datos, cifra y descifra), `actions.ts` (Server Actions: sesión + zod + auditoría), `crypto.ts`, `photos.ts`, `auth-server.ts` (`requireUser`, `audit`), `types.ts`, `templates.ts`.
- `apps/web/src/app/(panel)/panel/(app)/pacientes/**`: lista, ficha, casos, evolución, historia imprimible. `app/panel-media/[photoId]` y `app/api/clinico/fotos`: fotos privadas.
- `packages/db`: `migrations/*.sql` (fuente de verdad) y `src/schema.ts` (Drizzle, **debe reflejar el SQL**).
- Flags (`src/lib/flags.ts`): `FEATURE_SITE`, `FEATURE_CMS`, apagados por defecto.

## Pendiente
Validar con Inés antecedentes, lesiones y zonas del mapa; test e2e de galería del sitio (`test.fixme`, desde Next 16); 2FA y rotación de clave de cifrado; simulacro de restauración contra B2 real; deploy en Coolify (`docker-compose.coolify.yml`); inscripción AAIP y texto de consentimiento revisado por una persona con matrícula.
