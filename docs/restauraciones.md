# Simulacros de restauración

Requisito para cargar pacientes reales: al menos un simulacro **fechado y exitoso** contra el backup real en B2.

Procedimiento: `B2_REMOTE=b2:genesis-backups/prod sh scripts/restaurar.sh` (restaura el último dump en una base descartable y cuenta filas de `patients`, `clinical_entries`, `cases`, `clinical_photos`, `audit_log` y archivos de fotos). Después, abrir la app contra esa base con la **misma** `CLINICAL_DATA_ENCRYPTION_KEY` y leer una evolución.

| Fecha | Quién | Backup restaurado | Resultado |
|---|---|---|---|
| 2026-10-21 | Claude (local) | dump de una base de prueba, sin B2 | Solo mecánica `pg_dump` → `pg_restore` en Postgres 17 descartable: tablas, filas y los 3 triggers de inmutabilidad volvieron bien. **No cuenta** como simulacro: no usó B2 ni datos reales ni se leyó una evolución cifrada. |
