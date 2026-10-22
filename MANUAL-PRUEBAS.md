# Manual de pruebas manuales — Genesis

## REQ-SEG-002 — Sin datos clínicos en el navegador
1. Abrir un paciente y una atención con sesión iniciada.
2. En DevTools › Application: `localStorage` y `sessionStorage` no deben tener datos clínicos.
3. En Network: ninguna petición a CDNs ni trackers de terceros.

## REQ-SEG-006 — Backups verificados
1. Confirmar que el backup diario de la base y de las fotos corrió (fecha del archivo en el bucket).
2. Restaurar en una base vacía y comparar la cantidad de pacientes y atenciones.
