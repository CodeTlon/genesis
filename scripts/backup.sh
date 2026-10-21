#!/bin/sh
# Backup diario: dump de Postgres + volumen de fotos, comprimidos y subidos a B2 (rclone). Correr desde el host de Coolify (cron).
# La CLAVE DE CIFRADO (CLINICAL_DATA_ENCRYPTION_KEY) NO va en este backup: se guarda aparte en el gestor de secretos.
# Variables: DB_CONTAINER, APP_VOLUME, B2_REMOTE (ej: b2:genesis-backups/prod), RETENCION_DIAS (default 30)
set -eu
: "${DB_CONTAINER:?}" "${APP_VOLUME:?}" "${B2_REMOTE:?}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
docker exec "$DB_CONTAINER" pg_dump -U genesis -d genesis -Fc > "$TMP/db-$STAMP.dump"
docker run --rm -v "$APP_VOLUME":/data:ro -v "$TMP":/out alpine tar czf "/out/fotos-$STAMP.tgz" -C /data .
[ -s "$TMP/db-$STAMP.dump" ] || { echo "ERROR: dump vacío" >&2; exit 1; }
rclone copy "$TMP" "$B2_REMOTE/$STAMP" --checksum
rclone delete "$B2_REMOTE" --min-age "${RETENCION_DIAS:-30}d" --rmdirs
echo "backup OK $STAMP"
