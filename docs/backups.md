# Backups

Base de datos (historias, adendas, fotos cifradas, usuarios y registro de accesos) en un solo dump: `npm run backup` (local) o el script de la fábrica `backup-coolify.sh` hacia Backblaze B2 en producción (Regla 16b). La clave `GENESIS_DATA_KEY` se guarda aparte: sin ella los backups no se pueden leer.

Restauración de prueba: `node scripts/restore-test.mjs backups/<archivo>.dump`.

## Restauraciones de prueba
- 2026-10-23: restauración de prueba de `backups/genesis-2026-10-23.dump` en una base vacía. Pacientes/atenciones/adendas/fotos/accesos y contenido de las atenciones coinciden (10/5/0/0/117).
