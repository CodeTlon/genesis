# Bitácora de errores no obvios — Genesis

## Middleware bloqueaba el logo del login
`apps/panel/src/middleware.ts` redirige todo a `/login` sin cookie, incluidos los estáticos de `public/`: el logo del login daba "isn't a valid image". Se agregó `/logo.webp` a la lista de rutas abiertas. Cualquier asset nuevo que use `/login` debe agregarse ahí.

## typecheck y build en paralelo
`turbo run build typecheck` en paralelo falla con TS6053 (`.next/types` no existe). Correr `build` primero.

## Lighthouse en Windows
`chrome-launcher` tira EPERM al borrar el tmp al final, pero el JSON sí se escribe. Usar `CHROME_PATH` y `--output-path` absoluto.
