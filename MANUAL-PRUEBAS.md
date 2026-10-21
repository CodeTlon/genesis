# Manual de pruebas

**Automáticas:** `npm run build && npm run test:e2e` (Playwright, 3 viewports en el sitio). `e2e/panel.spec.ts` cubre: alta de paciente, antecedentes con alerta, consentimiento, caso, foto, evolución con mapa de pies y firma, adenda, cierre, historia, cifrado en la base, inmutabilidad, auditoría, acceso sin sesión, accesos cruzados entre pacientes, archivos que no son fotos y bloqueo de login.

**Manuales antes de cada entrega a Inés:**
1. Entrar desde el celular: el mapa de pies se usa con el dedo (zonas con área táctil suficiente) y el botón de firma mantiene presionado.
2. Subir una foto sacada con la cámara del celular: se ve en el caso y **no** abre sin sesión (probar el enlace de la foto en una ventana privada: debe dar 401).
3. Cerrar sesión y volver con el botón "atrás": no debe verse ninguna ficha.
4. Imprimir la historia (`Historia clínica completa`) y revisar que salgan antecedentes, evoluciones, adendas y conclusión.
5. Con `FEATURE_SITE` y `FEATURE_CMS` sin definir: `/` redirige al panel y `/panel/sitio` da "No encontramos esa página".
