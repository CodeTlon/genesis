# Propuesta: fotos-y-seguridad

## Por qué
Inés pidió subir fotos de la primera consulta y de la evolución. Es dato de salud: antes de usarlo con pacientes reales hay que cerrar la Fase 1 (acceso por profesional, cifrado, auditoría, backups) y la parte legal, que ella dijo que tiene que ordenar primero.

## Alcance
- Capacidades afectadas: FOT (nueva), SEG.
- Dentro: fotos de primera consulta y evolución con consentimiento, usuario por profesional con 2FA, cifrado del contenido clínico, registro de accesos, backups.

## Fuera de alcance
- Fotos para uso público o en el sitio (el consentimiento `imagePublic` queda aparte).
- Comparador visual antes/después más allá de ver las fotos por fecha.

## Preguntas abiertas
- Plazo de conservación de la historia clínica, consentimiento informado y registro de la base ante la autoridad de datos personales: **a confirmar con Inés y su asesor legal** (no se asume).
- ¿Cuántos profesionales usan el panel y ven todos los pacientes?

## Supuestos
- Las fotos se guardan en almacenamiento propio (volumen), nunca en un servicio de terceros, y se sirven solo con sesión.
- Una foto pertenece a una atención y hereda su firma.
