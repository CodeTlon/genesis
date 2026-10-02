# Bitácora de errores no obvios — Genesis

## Middleware bloqueaba el logo del login
`apps/panel/src/middleware.ts` redirige todo a `/login` sin cookie, incluidos los estáticos de `public/`: el logo del login daba "isn't a valid image". Se agregó `/logo.webp` a la lista de rutas abiertas. Cualquier asset nuevo que use `/login` debe agregarse ahí.

## typecheck y build en paralelo
`turbo run build typecheck` en paralelo falla con TS6053 (`.next/types` no existe). Correr `build` primero.

## Lighthouse en Windows
`chrome-launcher` tira EPERM al borrar el tmp al final, pero el JSON sí se escribe. Usar `CHROME_PATH` y `--output-path` absoluto.

## Servidor viejo ocupando el puerto en los E2E
`playwright.config.ts` usa `reuseExistingServer: true`: si quedó un `next start` de una prueba anterior (p. ej. Lighthouse) en el puerto 3000/3001, los tests corren contra un build viejo y fallan de forma confusa (`/api/revalidate` 404). Antes de correr E2E: `netstat -ano | grep ":300[01] .*LISTEN"` y matar ese PID puntual (no `taskkill /IM node.exe`).

## El valor del botón de envío no llega a la Server Action
`<button name="status" value="done">` dentro de `<form action={serverAction}>` NO manda `status` en el `FormData` (la acción corría y retornaba sin hacer nada). Usar un `<form>` por botón con `<input type="hidden">`.

## Parámetro de Postgres usado con dos tipos
`SET status=$3 ... CASE WHEN $3='new'` falla por tipos inconsistentes del parámetro; castear: `$3::text`.

## `unaccent` en columna generada
`unaccent()` es STABLE: una columna `GENERATED ... STORED` lo rechaza ("generation expression is not immutable"). Se usa el wrapper `immutable_unaccent()` de la migración 0001.
