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

## ADR-010 Demo pública compartible por link
- **Qué:** una versión de la demo para mostrar por link, pensada para una persona no técnica (~40 años), que se recorre sola con una guía interactiva.
- **Acceso:** el login es un botón "Entrar como Inés / Valentina" (perfiles ficticios, sin contraseña). Si se define `DEMO_PASSWORD`, se exige. Hay "Reiniciar demo" y "Salir" en el menú. El perfil elegido firma las atenciones.
- **Tour guiado:** `apps/panel/src/components/tour.tsx`, 6 pasos que navegan a cada pantalla; el paso se guarda solo en `sessionStorage` (no hay datos clínicos). Se relanza con el botón "Guía".
- **Hosting:** el sitio va en Vercel **sin base** (usa `@genesis/content/defaults`; el formulario de turno simula el envío). El panel va en **un solo proceso** (`Dockerfile.panel`, Railway/Fly con 1 instancia) porque su estado vive en memoria y en serverless se perdería entre requests. Sin `DATABASE_URL` en producción no se intenta conectar a localhost, y `/sitio` no guarda cambios.
- **Datos:** la semilla es relativa a "hoy" y se regenera si cambia el día, así que la agenda nunca queda vacía. El estado es compartido entre visitantes (no por sesión): suficiente para una demo con pocas personas; "Reiniciar demo" lo restaura.
- **Seguridad:** se eliminó el secreto por defecto de `/api/revalidate`: en producción, sin `REVALIDATE_SECRET` el endpoint queda cerrado.

## ADR-011 Sitio y panel en una sola app (un build, un dominio)
- **Qué:** el panel dejó de ser una app aparte. Vive dentro de `apps/web` bajo `/panel`. Un solo build y un solo dominio: en Vercel se importa el repo con **Root Directory `apps/web`**, sin `vercel.json`.
- **Estructura:** dos grupos de rutas con layout raíz propio: `app/(site)/…` (sitio, con header y footer) y `app/(panel)/panel/…` (panel, con su menú lateral). `app/not-found.tsx` es el 404 global, con su propio `<html>`.
- **Código del panel:** `src/panel/{components,lib}` (se importa con `@/panel/...`) y `src/middleware.ts`, que protege solo `/panel/*`. Todas las rutas internas del panel llevan el prefijo `/panel`.
- **Sin pegamento entre apps:** se eliminaron `WEB_URL`, `PANEL_URL`, `REVALIDATE_SECRET`, `/api/revalidate` y `/api/panel-url`. El sitio enlaza al panel con `/panel/login?tour=1` y el panel actualiza el sitio con `revalidatePath` directo.
- **Datos del panel:** siguen en memoria. En Vercel pueden volver al estado inicial si la función se reinicia o cambia de instancia: se acepta para la demo, y existe "Reiniciar demo".
- **Sin variables obligatorias:** ni `DATABASE_URL` (sin base el sitio usa los textos por defecto y "Sitio web" del panel no guarda) ni `DEMO_PASSWORD` (sin ella el acceso es libre con perfiles ficticios).
- **Reemplaza** a la idea anterior de dos proyectos o dos servicios y al `Dockerfile.panel`.

## ADR-012 De demo a proyecto real (reemplaza ADR-008 y ADR-010)
- **Qué:** se descartó la demo. Genesis es el sistema de historias clínicas de Inés (podología). Los datos viven en Postgres, no en memoria ni cookies. Se eliminaron agenda, "Hoy", "Resumen", plantillas de láser/anamnesis, perfiles de práctica, "Reiniciar demo" y la guía interactiva.
- **Ramas:** `feature/*` → PR a `dev` → `test` → `main`. Promover lo hace Mateo.
- **Alcance:** pacientes, antecedentes estructurados con alertas, casos (conclusión y sugerencias), evoluciones firmadas con adenda, mapa de pies v2 (egipcio/griego/romano, a tratar/tratado), fotos privadas, consentimientos, auditoría, exportación imprimible. El sitio público y el CMS se conservan pero **apagados por defecto** (`FEATURE_SITE`, `FEATURE_CMS`).
- **Pendiente de validar con Inés:** campos de antecedentes, lesiones y zonas del mapa, y si usa otra clasificación de pie (plano, cavo).

## ADR-013 Alineación con la flota
- Next 16.4.2, React 19.3.1, TypeScript 6.0.3, Zod 4.6.7, ESLint 10 plano, Better Auth 1.7.12, Drizzle 0.45.4. Versiones exactas, sin `^`. `middleware.ts` pasó a `proxy.ts`.
- **Desvío conocido:** las migraciones son SQL a mano (`packages/db/migrations`), y `schema.ts` de Drizzle las **refleja** para consultar con tipos; no se usa `drizzle-kit generate`. Motivo: el esquema ya tenía extensiones, triggers y `EXCLUDE` que Drizzle no genera. Si se agrega una columna hay que tocar el SQL **y** `schema.ts`.
- **Instalación:** Better Auth declara peers opcionales que rompen el resolvedor de npm (`edgesOut`). Se instala con `--legacy-peer-deps` (también en el Dockerfile). `zod` va declarado en la raíz porque `better-call` lo busca ahí.
- Tailwind quedó en 4.3.3. Fuentes autoalojadas: ya lo estaban (`@/fonts`).

## ADR-014 Seguridad de datos clínicos
- **Cifrado:** AES-256-GCM a nivel aplicación (`panel/lib/crypto.ts`) para antecedentes, motivo, conclusión, sugerencias, payload de evoluciones y texto de adendas. `CLINICAL_DATA_ENCRYPTION_KEY` es obligatoria y no tiene valor por defecto. **Si se pierde, los datos son irrecuperables:** se guarda aparte y fuera del backup de la base. Quedan en claro los campos por los que se busca o filtra (nombre, DNI, estado del caso).
- **Inmutabilidad en la base:** evoluciones firmadas, adendas y `audit_log` no se editan ni se borran (triggers). Sin borrado físico de pacientes (`deleted_at`) ni de fotos.
- **Hash encadenado:** cada evolución firmada guarda el hash de la anterior del paciente.
- **Sesión:** Better Auth, sin registro público; usuarios por `scripts/crear-usuario.mjs`. Sesión de 8 h. `proxy.ts` solo filtra por cookie; **cada página y acción vuelve a validar** con `requireUser()` contra la base. Bloqueo de login: 5 fallos por correo y 30 por IP en 15 min (umbrales distintos para que un atacante no deje afuera a todo el consultorio).
- **Server Actions son endpoints públicos:** todas las del panel y las 14 del CMS exigen sesión; las del CMS además el flag. El formulario público de turnos exige `FEATURE_SITE`.
- **Fotos:** `/panel-media/[id]` con sesión, `no-store`, `nosniff`, CSP `sandbox` y auditoría. Subida por route handler: lista cerrada de tipos validada por **contenido** con `sharp`, máximo 8 MB, re-encode a WebP (sin EXIF/GPS), nombre UUID, volumen fuera de `public/`. Sin consentimiento de fotos vigente no se sube (lo exige además `consent_id NOT NULL`).
- **Límites conocidos:** el límite de intentos de login depende de `x-forwarded-for` (detrás de Coolify lo fija el proxy). No hay 2FA ni rotación de la clave de cifrado todavía.

## ADR-015 Despliegue y respaldos
- `docker-compose.coolify.yml` (app + `postgres:17-alpine`, volúmenes `pgdata` y `storage`), un compose por entorno con **sus propias** claves. `docker-entrypoint.sh` no arranca sin variables obligatorias y `scripts/migrar.mjs` falla cerrado.
- `scripts/backup.sh` (dump + fotos a B2) y `scripts/restaurar.sh` (simulacro sobre base descartable). **Hasta que `docs/restauraciones.md` tenga un simulacro fechado contra B2 real, no se cargan pacientes reales.**

## ADR-016 Sin sitio público ni CMS (reemplaza lo del sitio en ADR-001…011 y los flags de ADR-012)
- **Qué:** el cliente final quiere solo historias clínicas. Se eliminaron el sitio público (`app/(site)`), el CMS (`/panel/sitio`, `cms*.ts`), `packages/content`, el seed, los flags `FEATURE_SITE` y `FEATURE_CMS` y los componentes del sitio. `/` redirige al panel; `robots.txt` no indexa nada.
- **Base de datos:** la migración `0004_solo_historias.sql` borra las tablas del sitio, la agenda y la simulación de WhatsApp (`media`, `service_groups`, `site_services`, `gallery_items`, `site_content`, `appointment_requests`, `appointments`, `resources`, `services`, `whatsapp_threads_demo`) y `foot_markers` (sin uso: las marcas van en el payload cifrado). **Es irreversible** para esas tablas; no había datos reales.
- **Quedan** `areas`, `professionals`, `form_templates` y `form_template_versions` solo porque `clinical_entries` tiene FK hacia ellas (nullable). Se pueden soltar más adelante.
- **Recuperación:** todo el código eliminado sigue en el historial de git (commit `8e78e50` es el último con sitio y CMS).

## ADR-017 SDD y ficha completa de Inés (23/10/2026)
- **SDD (perfil S2):** `specs/` con 20 REQ en 6 capacidades (PAC, ANT, CAS, EVO, FOT, SEG), `scripts/spec-lint.mjs` y un paso de CI. Cada test E2E lleva `[REQ-XXX-NNN]`. La brecha conocida es REQ-SEG-005 (simulacro de restauración real contra B2).
- **Ficha en papel de Inés** (fotos del 20/10, sin copiarlas al repo por tener datos de una paciente real): migración `0005_ficha_ines.sql` con primera consulta, nacionalidad, sexo, estatura, peso, grupo sanguíneo y otras actividades; los 18 antecedentes con la alerta nueva de **antiagregados**; bloque de diabetes y antecedentes familiares (cifrados con las notas); y en la evolución el examen por pie, las patologías por dedo (campo `digits`), el tratamiento preventivo y el control.
- **"Romano" = cuadrado/polinesio** es una suposición a confirmar con Inés.
- **Sin 2FA por ahora** (decisión de Mateo, 22/10): sigue en Pendiente junto con la rotación de la clave de cifrado.
- La rama `feature/sdd-historias-clinicas` conserva una implementación paralela (modelo `hc_*`, mejora visual) hecha sobre una base anterior; queda como referencia, no se mergea.

## ADR-018 UX para usuarias +35: ficha en pestañas, toasts y mapa en hoja modal (23/10/2026)
- **Qué:** la ficha pasa de una página larga a pestañas (Casos, Antecedentes, Datos) con la pestaña en `?tab=`; antecedentes y datos se leen primero y se editan con un botón "Editar". La lista filtra en vivo (debounce 250 ms, con fallback GET sin JS) y pagina de a 25. Los avisos de "Guardado" son toasts; los errores quedan fijos y reciben el foco.
- **Mapa de pies:** zonas con área de toque ampliada (>= 44 px), la edición de la zona abre un `<dialog>` modal (hoja inferior en celular, ventana centrada en escritorio) con Escape y foco que vuelve a la zona; la gravedad se ve también como número o tilde, no solo por color; miniatura de solo lectura en evoluciones firmadas e historia.
- **Firma:** se mantiene "mantener presionado" y se suma un botón "Firmar" con confirmación explícita (alternativa para temblor o movilidad reducida). Aviso del navegador si se cierra con cambios sin guardar.
- **Movimiento:** solo CSS nativo (sin librería): View Transitions entre páginas, acordeón con `::details-content`, entrada de hoja/toast. `prefers-reduced-motion` quita el movimiento y conserva los cambios de color.
- **Tokens:** estados semánticos (`ok`, `aviso`, `error`, `info`) y `tinta-suave` (8.4:1) para texto secundario; mínimo 16 px en texto de datos.
- **Despliegue:** Dockerfile en Node 24 (igual que el CI) y job de CI que construye la imagen.
- **Pendiente de validar con Inés:** si prefiere la firma de un toque como principal, y el orden de las pestañas.

## ADR-019 Sin módulo de consentimientos
- **Qué:** a pedido de Mateo se quita la pestaña Consentimientos, el bloqueo de subida de fotos sin consentimiento y la sección de la historia imprimible. La migración `0006_sin_consentimientos.sql` borra la tabla `consents` y la columna `clinical_photos.consent_id` (irreversible; ninguna base tenía datos reales).
- **Consecuencia:** las fotos son dato de salud (ley 25.326) y el consentimiento deja de quedar registrado en el sistema; Inés debe gestionarlo por fuera (papel). REQ-FOT-001 pasa a "Subir fotos al caso".
- **Pendiente:** texto de consentimiento revisado por una persona con matrícula (fuera del sistema).

## ADR-020 Inicio, login y avisos propios
- **Inicio:** tras el login se llega a `/panel/inicio` (saludo, buscador, totales, evoluciones sin firmar y firmadas, pacientes recientes). `repo.dashboard()` solo cuenta y lista metadatos; no descifra nada clínico.
- **Sin diálogos del navegador:** no se usa `alert`, `confirm` ni los globos de validación. `FormValidity` los reemplaza por un mensaje debajo del campo; el borrado de fotos y la salida con cambios sin guardar usan modales propios. Queda el aviso del navegador al cerrar la pestaña con algo sin guardar (no se puede personalizar) y los controles nativos de lista, fecha y archivo.
- **Movimiento:** los `<dialog>` entran y salen con `@starting-style` y `allow-discrete`; los bloques que se despliegan usan `g-reveal`; las marcas del mapa entran con un rebote corto. Todo se reduce con `prefers-reduced-motion`.

## ADR-021 Flujos separados y prueba con volumen
- **Qué:** el inicio dejaba cuatro tarjetas que llevaban a los mismos lugares. Ahora hay cinco secciones: Inicio, Pacientes, Casos (abiertos, de todos los pacientes), Atenciones (sin firmar y firmadas del mes) y Nuevo. Cada tarjeta lleva a una pantalla con título y propósito propios; el inicio solo conserva "Para retomar" y los pacientes recientes.
- **Volumen:** los listados paginan en el servidor con páginas numeradas, Anterior/Siguiente y el rango mostrado (25 pacientes, casos o atenciones por página; 10 casos de un paciente y 10 evoluciones de un caso; las fotos se muestran de a 12), conservando la búsqueda o la pestaña en la URL y las consultas del inicio solo cuentan o listan metadatos, sin descifrar.
- **Prueba:** `scripts/sembrar-prueba.ts` (solo con `SEMBRAR_DATOS_FICTICIOS=si` y nunca en producción) usa las funciones de `repo.ts` para crear pacientes mínimos, estándar, completos, menores, sin ficha y casos extremos (nombres larguísimos, los 18 antecedentes, un caso de 40 evoluciones). `e2e/dispositivos.spec.ts` lo carga y recorre todas las pantallas en 390, 768 y 1440 px verificando que no haya scroll horizontal ni errores.
- **No cubierto:** fotos de volumen y dispositivos físicos (solo se simulan anchos de pantalla y táctil en Chromium).

## ADR-022 Rediseño «calma clínica»
- **Qué:** a pedido de Mateo, tras usar el panel: base de 14 px (los controles táctiles siguen en 48 px fijos y los campos en 16 px para que iOS no haga zoom), neutros más quietos (fondo más claro, bordes finos, sombras suaves) y violeta solo como acento. Guía: los `DESIGN.md` de Notion y Apple de `codetlon-cloud/references/diseños`.
- **Alertas:** `AlertCard` (ficha, caso y evolución) ordena de la más grave a la menos grave (`ALERT_LEVEL`), con franja lateral de color, ícono, nombre y frase de implicancia (`ALERT_HINT`). **Las frases son una propuesta a validar con Inés**; si no se validan, se vacían y queda solo el nombre. En la lista de pacientes hay un único indicador «N alertas».
- **Piezas de la biblioteca (reescritas sin dependencias, solo la idea):** `kokonutui/action-search-bar` → paleta de búsqueda (`command-search.tsx`, combobox + listbox sobre `<dialog>`); `kokonutui/metric-card` y `number-flow` → `count-up.tsx`; `kokonutui/lightbox-grid` → grilla con etiqueta y `compare-slider.tsx` (deslizador `<input type=range>`).
- **Ruta nueva:** `GET /api/clinico/buscar?q=` (sesión obligatoria, `q` de 2 a 80 caracteres, máximo 8 resultados, solo identificación; nunca textos clínicos).
- **Accesibilidad:** `e2e/accesibilidad.spec.ts` corre axe (WCAG 2.1 A/AA) en las pantallas principales en celular y escritorio y falla con problemas serios o críticos; ya encontró y se corrigió un contraste del avatar. Todo lo táctil mide al menos 44 px (`e2e/dispositivos.spec.ts`).
- **Pendiente:** validar con Inés las frases de las alertas; probar en celular físico.

## ADR-023 Filtros de los listados y shell más limpio
- **Filtros en el servidor** (`repo.ts`: `PatientFilters`, `CaseFilters`, `AttentionFilters`): el texto busca por nombre, DNI, teléfono o título del caso sin tildes (`immutable_unaccent`); los estados se resuelven con `exists` y no descifran nada. `FilterBar` los muestra como chips (enlaces reales: funcionan sin JavaScript, quedan en la URL y vuelven a la primera página al cambiar). Solo se navega al escribir cuando el texto cambió, para no pisar los clics en chips.
- **Shell:** a pedido de Mateo se sacaron la búsqueda y «Nuevo paciente» de la barra lateral y del inicio, la tarjeta «Historias clínicas» y las iniciales (usuaria y paciente). «Nuevo paciente» sigue en la lista de pacientes. La búsqueda rápida sigue con `/` o Ctrl+K y con el ícono en el celular.

## ADR-024 Filtros como desplegables y atenciones sin pestañas
- **Desplegables:** los filtros pasan de chips a `<select>` (uno por filtro, con etiqueta); en el celular se pliegan detrás de «Filtros (N)». Siguen en la URL y, sin JavaScript, se envían con «Aplicar».
- **Atenciones:** una sola lista con filtros de estado (todas, borradores, firmadas), período (todo el tiempo, hoy, 7 días, este mes, mes pasado, 90 días; sobre la fecha de firma o, en borradores, de inicio, en horario de Córdoba UTC-3) y orden. La explicación de borrador y firma era para Mateo y no va en pantalla: borrador = se escribe y se edita; firmada = queda cerrada y se corrige con adenda.
- **Inicio:** «Firmadas este mes» no servía como indicador (crece sin parar y no dice qué hacer). Ahora: Pacientes, Casos abiertos, Borradores sin firmar (lo pendiente) y Atenciones de hoy (la actividad del día). Cada número coincide con el total de su listado (se prueba).
- **Datos de prueba:** las evoluciones firmadas no se pueden modificar (trigger de la base); para fecharlas en el pasado, `fixtures-filtros.ts` apaga ese trigger un instante, solo con datos ficticios y nunca en producción.
