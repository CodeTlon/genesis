#!/bin/sh
# SIMULACRO DE RESTAURACIÓN: restaura el dump más reciente en una base DESCARTABLE y verifica conteos. Nunca toca producción.
# Uso: B2_REMOTE=b2:genesis-backups/prod sh scripts/restaurar.sh [carpeta-del-backup]
set -eu
: "${B2_REMOTE:?}"
DIR=${1:-$(rclone lsf "$B2_REMOTE" --dirs-only | sort | tail -1 | tr -d '/')}
TMP=$(mktemp -d); trap 'rm -rf "$TMP"; docker rm -f genesis-restore-test >/dev/null 2>&1 || true' EXIT
rclone copy "$B2_REMOTE/$DIR" "$TMP"
docker run -d --name genesis-restore-test -e POSTGRES_PASSWORD=x postgres:17-alpine >/dev/null
sleep 8
docker exec -i genesis-restore-test pg_restore -U postgres -d postgres --no-owner < "$(ls "$TMP"/db-*.dump)"
for t in patients clinical_entries cases clinical_photos audit_log; do
  printf "%s: " "$t"; docker exec genesis-restore-test psql -U postgres -tAc "select count(*) from $t"
done
tar tzf "$(ls "$TMP"/fotos-*.tgz)" | wc -l | xargs echo "archivos de fotos:"
echo "SIMULACRO OK ($DIR) — anotar fecha y resultado en docs/restauraciones.md"
