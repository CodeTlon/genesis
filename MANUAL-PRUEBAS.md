# Manual de pruebas manuales — Genesis

## REQ-SEG-002 — Sin datos clínicos en el navegador
1. Abrir un paciente y una atención con sesión iniciada.
2. En DevTools › Application: `localStorage` y `sessionStorage` no deben tener datos clínicos.
3. En Network: ninguna petición a CDNs ni trackers de terceros.

## REQ-PAC-006 — Campos de la ficha de Inés
1. Esperar la foto de la ficha de referencia de Inés.
2. Comparar campo por campo con la ficha del panel; lo que falte se agrega y lo que no aplique se descarta por escrito.

## REQ-SEG-006 — Backups verificados
1. Confirmar que el backup diario de la base y de las fotos corrió (fecha del archivo en el bucket).
2. Restaurar en una base vacía y comparar la cantidad de pacientes y atenciones.
