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

## Despliegue en Coolify
1. Recurso **Docker Compose** apuntando a `docker-compose.coolify.yml` (la rama `main`; `test` para pruebas).
2. En el servicio `app` asignar el dominio (puerto 3000) con HTTPS (Let's Encrypt). El proxy debe pasar `x-forwarded-for` (el bloqueo de intentos de login depende de eso, ADR-014).
3. Variables (ver `.env.example`; **nunca** al repo): `DATABASE_URL`, `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=https://<dominio>`, `CLINICAL_DATA_ENCRYPTION_KEY`. Guardar la clave de cifrado **aparte** del backup: si se pierde, los datos son irrecuperables.
4. Crear el primer usuario con `scripts/crear-usuario.mjs` desde la terminal del contenedor.
5. Programar `scripts/backup.sh` (cron del host) y hacer el simulacro de `scripts/restaurar.sh`; registrarlo en `docs/restauraciones.md`.
6. Prueba de humo: `/api/health`, login, crear un paciente ficticio.

## Ramas y entornos
`feature/<origen>-<tarea>` → PR a `dev` → `test` → `main`. Producción en Coolify con `docker-compose.coolify.yml`; variables en `.env.example`.

## Cambios
- **2026-10-28** — Escala de la interfaz: base de 16 px en vez de 18 px (todo se sentía grande); los botones táctiles siguen en 48 px.
- **2026-10-28** — Flujos separados: Casos abiertos y Atenciones (sin firmar / firmadas) son pantallas propias y cada tarjeta del inicio lleva a la suya; barra de navegación de 5 secciones; `scripts/sembrar-prueba.ts` carga datos ficticios de distintos volúmenes y tipos de paciente, y `e2e/dispositivos.spec.ts` recorre todo en celular, tableta y escritorio (REQ-INT-001..003). Los listados (pacientes, casos, atenciones, casos de un paciente y evoluciones de un caso) paginan en el servidor con páginas numeradas.
- **2026-10-28** — Pantallas menos cargadas, con la misma información mejor ordenada: ruta de migas que hace de "volver", secciones plegables en el alta y en antecedentes, evolución en tarjetas, caso con evoluciones primero y fotos plegadas, botones Cancelar reales (REQ-PAC-009).
- **2026-10-27** — Rediseño: pantalla de Inicio con resumen (pendientes, totales, recientes) y barra lateral completa; login nuevo en dos columnas; mapa de pies con degradé, dedos orgánicos y marcas animadas; vista previa de fotos; modales con animación de entrada y salida; errores de formulario dentro de la página y aviso propio al salir con cambios (REQ-PAC-008, REQ-FOT-004, REQ-SEG-007, ADR-020).
- **2026-10-27** — El login tiene un ojo para mostrar u ocultar la contraseña (REQ-SEG-006).
- **2026-10-23** — Se elimina el módulo de consentimientos (ADR-019): sin pestaña, sin bloqueo de fotos y sin sección en la historia imprimible; migración 0006.
- **2026-10-21** — Se elimina el sitio público y el CMS (ADR-016): el producto es solo historias clínicas.
- **2026-10-21** — Pasa de demo a proyecto real: Postgres, login real, cifrado de campos clínicos, antecedentes, casos, mapa de pies v2, fotos privadas, consentimientos, auditoría, Docker/Coolify y backups.
- 23/10: specs SDD (S2) + CI; ficha completa de Inés (datos, 18 antecedentes, diabetes, examen por pie, patologías por dedo, control).
- 23/10: UX para usuarias +35 (ADR-018): ficha en pestañas con lectura/edición, lista con búsqueda en vivo, toasts, mapa de pies en hoja modal con insignias de gravedad, firma de un toque, transiciones CSS y esqueletos por pantalla. Dockerfile en Node 24 y CI construye la imagen.
