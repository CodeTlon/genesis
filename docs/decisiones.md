# Decisiones (ADR cortos) — Genesis · Checkpoint 2

## ADR-001 Stack: Opción A (Next.js + Postgres propio), no Supabase ni ASP.NET
- **Decisión:** monorepo Turborepo, Next.js **15.5.25** (fijo de la fábrica) + TypeScript + Tailwind + shadcn + Zod, PostgreSQL 16 con Drizzle ORM y migraciones SQL.
- **Por qué:** datos de salud ⇒ cifrado a nivel aplicación, restricción de exclusión para turnos, triggers de inmutabilidad y hosting decidido por nosotros (ley 25.326, transferencia internacional ⚖️). Supabase (default de la fábrica) deja esos puntos fuera de nuestro control. Opción B (.NET) no suma: todo el equipo vive en TS.
- **Excepción a la fábrica:** no Supabase (Regla de Oro #7 sobre infra sigue: deploy y servidor los gestiona Mateo).

## ADR-002 Demo con Postgres real
- docker compose local (`postgres:16`) + seed reproducible con `@faker-js/faker` locale `es_AR`. Las migraciones y la exclusión anti doble reserva de la demo **se reusan en Fase 1**; los datos y las pantallas se pueden tirar.
- Alternativa descartada: datos en memoria (no prueba concurrencia ni sirve de base).

## ADR-003 Dos apps, un solo servidor de panel
- `apps/web` (sitio público, SSR/ISR, `www.`) y `apps/panel` (interno, `app.`, `noindex`, sin cookies compartidas). Sin microservicios.

## ADR-004 Dependencias (todas justificadas)
| Dep | Dónde | Motivo |
|---|---|---|
| drizzle-orm / drizzle-kit, `pg` | db | ORM + migraciones SQL |
| zod | todo | validación |
| motion | panel | solo Stepper (copiado de react-bits) |
| @dnd-kit/core | panel | arrastrar y soltar en la agenda (a11y + táctil) |
| sonner | panel | toasts con "Deshacer" |
| @faker-js/faker | db (dev) | seed ficticio es-AR |
| Fuera: gsap, three, ogl, CDNs, analytics | — | peso / privacidad |
- **Agenda:** grilla propia (día/semana por profesional y recurso) + dnd-kit. FullCalendar recursos es de pago; Schedule-X/react-big-calendar se evalúan solo si la grilla propia se complica.
- **Auth demo:** una contraseña única por variable de entorno + `noindex`. Auth real (Argon2id, TOTP) = Fase 1.
- **Fuentes:** Montserrat + Roboto Condensed vía `next/font` (autoalojadas).

## ADR-005 Marca CodeTlon
- Sin `<CodeTlonBadge />` ni créditos en demo/sitio (pedido explícito del cliente final; excepción a la Regla de Oro #11 de la fábrica). Footer neutro.

## ADR-006 Contenido clínico = propuesta
- Plantillas A–J cargadas como `draft`, con banner "Propuesta a validar con la profesional". La demo implementa A, B y C.

## Estructura del monorepo (`../output/genesis`)
```
apps/web        sitio público (Next 15)
apps/panel      sistema interno (Next 15)
packages/db     drizzle schema, migraciones SQL, seed faker es-AR
packages/ui     tokens + componentes (vendor/: SpotlightCard, Stepper, HoldButton; Reveal propio)
packages/config tsconfig/eslint/tailwind preset + tokens de marca (único archivo)
content/        servicios.json (de analisis/)
docs/           decisiones.md, imagenes.md, marca.md, guion-demo.md, incidentes.md
docker-compose.yml  postgres:16 (dev)
```
Nombre del repo: `codetlon/genesis` (privado); ramas `main` + `dev`; commits convencionales **sin Co-Authored-By**.

## Preguntas abiertas para Mateo (no bloquean el scaffold)
1. VPS/Dokku: ¿subdominio temporal para la demo? (ej. `genesis-demo.<dominio>`; usuario SSH a confirmar).
2. Contraseña de acceso de la demo (la defino yo en `.env`, vos se la pasás a Inés).
3. Nombre del repo: ¿`genesis` o `genesis-estetica`?

## ADR-007 Hosting de la demo: Vercel (preferido por Mateo) + Postgres administrado
- Demo (datos ficticios): `apps/web` y `apps/panel` en Vercel como dos proyectos; Postgres administrado externo (Vercel no aloja Postgres propio; p. ej. Neon/Supabase solo como base de datos, sin su auth). El deploy y la creación de cuentas/DB los hace Mateo (Regla de Oro #7).
- Producción con datos reales (Fase 1): **reevaluar**. Datos de salud (ley 25.326, transferencia internacional ⚖️) → VPS propio con Dokku + Postgres cifrado es la opción por defecto; Vercel solo para el sitio público.
- Las apps no deben depender de APIs exclusivas de Vercel, para poder migrar a Dokku sin reescribir.

## ADR-008 Panel de la demo con datos en memoria (cambia ADR-002)
- Docker/Postgres no estaban disponibles en la máquina de desarrollo, así que el panel de la demo usa datos ficticios en memoria del servidor (`apps/panel/src/lib/store.ts`), con la misma interfaz que luego tendrá la capa Postgres. Se reinician al reiniciar el servidor (en Vercel, también entre instancias): aceptable para una demo.
- Se mantienen `docker-compose.yml`, `packages/db/migrations/0001_init.sql` y el runner de migraciones para Fase 1. La exclusión anti doble reserva y el trigger de inmutabilidad **ya están escritos en SQL pero sin probar contra una base**; en la demo los reproduce `store.ts`. Pendiente de validar con `docker compose up`.
- Sin datos clínicos en `localStorage` ni cachés del navegador; el estado vive en el servidor.

## ADR-009 Sitio 100 % editable desde el panel (CMS propio sobre Postgres)
- **Qué:** todo lo que se ve en el sitio (portada, grupos y tratamientos con fotos/sesiones/precios, nosotros y equipo, contacto y horarios, galería, aviso superior, SEO) se edita desde `Sitio web` en el panel, sin tocar código. Mismo patrón que gc2 y academia-tvproacademy (contenido clave/valor + entidades con CRUD + subida de imágenes), pero sobre Postgres propio en vez de Supabase.
- **Modelo (migración 0002):** `site_content` (clave/valor JSON), `service_groups`, `site_services`, `gallery_items`, `media`; el formulario del sitio escribe en `appointment_requests` y el panel lo muestra como bandeja.
- **Respaldo:** `@genesis/content/defaults` tiene todos los textos actuales. Si la base está vacía o no responde (1,5 s de timeout), el sitio muestra esos textos: nunca queda en blanco y el build no necesita base.
- **Dos apps, un contenido:** el sitio y el panel comparten la base (`@genesis/db`). El sitio usa ISR (`revalidate = 60`) y el panel avisa a `POST /api/revalidate` (secreto `REVALIDATE_SECRET`) después de guardar para actualizarlo al instante.
- **Imágenes:** se procesan en el servidor con sharp (corrige orientación, achica a 1600 px, pasa a WebP y **elimina EXIF/GPS**), tope 4 MB (el cuerpo de las funciones de Vercel corta en ~4,5 MB) y se guardan en la tabla `media`, servidas por `/media/<id>`. Fase 1: object storage cifrado.
- **Consentimiento en la galería:** una constraint de la base (`CHECK (NOT published OR consent_public)`) impide publicar una foto sin confirmar que no hay personas o que hay consentimiento de uso público (regla de imagen del prompt).
- **Fuera de alcance por ahora:** roles (todo el que entra al panel edita; Fase 1), historial de versiones del contenido, editor de plantillas clínicas, vista previa sin publicar.
