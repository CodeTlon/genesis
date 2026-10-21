#!/bin/sh
# Falla cerrado: sin variables obligatorias o con una migración rota, el contenedor no arranca.
set -eu
for v in DATABASE_URL BETTER_AUTH_SECRET BETTER_AUTH_URL CLINICAL_DATA_ENCRYPTION_KEY; do
  eval "val=\${$v:-}"
  [ -n "$val" ] || { echo "ERROR: falta la variable obligatoria $v" >&2; exit 1; }
done
node scripts/migrar.mjs
exec node apps/web/server.js
