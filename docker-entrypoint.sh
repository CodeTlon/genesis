#!/bin/sh
# Falla cerrado: sin variables obligatorias o con una migración rota, el contenedor no arranca.
set -eu
for v in DATABASE_URL BETTER_AUTH_SECRET BETTER_AUTH_URL CLINICAL_DATA_ENCRYPTION_KEY; do
  eval "val=\${$v:-}"
  [ -n "$val" ] || { echo "ERROR: falta la variable obligatoria $v" >&2; exit 1; }
done
node scripts/migrar.mjs

# Solo en el entorno de PRUEBA (APP_ENV=prueba y PRUEBA_SEMBRAR=si): crea el usuario de la clienta y carga datos ficticios si la base está vacía.
# Nunca se frena el arranque por esto. En producción no se define APP_ENV y no hace nada.
if [ "${APP_ENV:-}" = "prueba" ] && [ "${PRUEBA_SEMBRAR:-}" = "si" ]; then
  if [ -n "${PRUEBA_CLAVE:-}" ]; then
    USER_PASSWORD="$PRUEBA_CLAVE" node scripts/crear-usuario.mjs "${PRUEBA_NOMBRE:-Inés}" "${PRUEBA_CORREO:-ines@genesis.test}" admin || echo "aviso: no se creó el usuario de prueba (puede que ya exista)"
  fi
  SEMBRAR_DATOS_FICTICIOS=si SOLO_SI_VACIO=si EXTREMOS=no CANTIDAD="${PRUEBA_CANTIDAD:-40}" node scripts/sembrar-prueba.cjs || echo "aviso: no se cargaron los datos de prueba"
fi

exec node apps/web/server.js
