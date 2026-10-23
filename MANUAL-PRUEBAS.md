# Manual de pruebas

**Automáticas:** `npm run build && npm run test:e2e` (Playwright). `e2e/panel.spec.ts` cubre: alta de paciente, antecedentes con alerta, consentimiento, caso, foto, evolución con mapa de pies y firma, adenda, cierre, historia, cifrado en la base, inmutabilidad, auditoría, acceso sin sesión, accesos cruzados entre pacientes, archivos que no son fotos y bloqueo de login.

**Manuales antes de cada entrega a Inés:**
1. Entrar desde el celular: el mapa de pies se usa con el dedo (zonas con área táctil suficiente) y el botón de firma mantiene presionado.
2. Subir una foto sacada con la cámara del celular: se ve en el caso y **no** abre sin sesión (probar el enlace de la foto en una ventana privada: debe dar 401).
3. Cerrar sesión y volver con el botón "atrás": no debe verse ninguna ficha.
4. Imprimir la historia (`Historia clínica completa`) y revisar que salgan antecedentes, evoluciones, adendas y conclusión.
5. Abrir `/` sin sesión: lleva al login. No hay sitio público ni `/panel/sitio`.

## REQ-SEG-005 — Backup y simulacro de restauración
1. Confirmar que el backup diario de la base y las fotos corrió (fecha del archivo en B2).
2. Correr `B2_REMOTE=b2:genesis-backups/prod sh scripts/restaurar.sh` y comparar las cantidades de pacientes, evoluciones y fotos.
3. Abrir la app contra esa base con la misma `CLINICAL_DATA_ENCRYPTION_KEY` y leer una evolución.
4. Anotar la fecha y el resultado en `docs/restauraciones.md`. Sin un simulacro exitoso no se cargan pacientes reales.
