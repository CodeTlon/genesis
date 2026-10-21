# Errores conocidos y lecciones

- **npm `Cannot read properties of null (reading 'edgesOut')`** al instalar `better-auth`: usar `--legacy-peer-deps` (ver ADR-013).
- **`Can't resolve 'zod'` en Docker pero no en local:** `better-call` busca `zod` ^4 en la raíz; local había una copia 3.x hoisteada por casualidad. `zod` va fijado en la raíz.
- **`next` no encontrado (127) en el build de Docker:** `npm ci` deja dependencias en `apps/web/node_modules`; la etapa de build copia el árbol completo de la etapa `deps`.
- **El puerto 5432 puede estar ocupado** por otro proyecto: Genesis usa 5433.
- **`notFound()` devuelve HTTP 200** en rutas con `loading.tsx` (el streaming ya envió el estado). Los tests verifican el contenido, no el código.
- **Las Server Actions son endpoints públicos:** toda acción nueva debe empezar con `requireUser()` (o `guardCms()`).
- **Bug abierto:** `e2e/cms.spec.ts` "galería" (`test.fixme`): tras publicar con consentimiento, `/galeria` no muestra la foto aunque la base sí está bien. Solo afecta al sitio público.
- **Bloqueo de login por IP compartida:** los umbrales por correo (5) e IP (30) son distintos a propósito.
