---
capacidad: SEG
perfil: S2
rutas: apps/web/src/proxy.ts, apps/web/src/lib/auth.ts, apps/web/src/panel/lib/auth-server.ts, apps/web/src/panel/lib/crypto.ts, scripts
---
# Seguridad y acceso

Una historia clínica es dato de salud: entra solo quien tiene usuario, cada acceso queda registrado y hay backup verificado. Segundo factor (2FA): decisión 22/10 de no hacerlo por ahora.

## Requisitos

### REQ-SEG-001 [must] Sin sesión no se lee ni se escribe
El sistema DEBE redirigir a `/panel/login` toda ruta del panel sin sesión y NO DEBE permitir abrir datos de un paciente bajo el ID de otro.
- Escenario: Dado un visitante sin sesión, Cuando abre `/panel/pacientes`, Entonces termina en el login; el caso de un paciente no se abre bajo otro.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-SEG-002 [must] Bloqueo por intentos fallidos
El sistema DEBE bloquear los intentos de ingreso repetidos con clave incorrecta y avisar "Demasiados intentos", sin bloquear a otros usuarios.
- Escenario: Dado 6 claves incorrectas seguidas, Cuando se intenta de nuevo, Entonces avisa "Demasiados intentos".
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-SEG-003 [must] Auditoría que no se borra
El sistema DEBE registrar quién vio un paciente, firmó una evolución o vio una foto, y ese registro NO DEBE poder editarse ni borrarse (trigger en la base).
- Escenario: Dado un profesional que abre una ficha, Cuando se consulta el registro, Entonces figura la acción; un DELETE directo falla.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-SEG-004 [must] Sin sitio público
El sistema NO DEBE exponer sitio público ni CMS: la raíz lleva al login y `robots.txt` prohíbe indexar todo.
- Escenario: Dado un visitante, Cuando abre `/`, Entonces termina en el login.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-SEG-005 [must] Backup con simulacro de restauración fechado
El sistema DEBE tener backup diario de la base y las fotos en B2 y un simulacro de restauración fechado y exitoso antes de cargar pacientes reales.
- Escenario: Dado el último backup en B2, Cuando se restaura en una base descartable, Entonces se lee una evolución cifrada con la misma clave.
- verify: manual MANUAL-PRUEBAS.md#REQ-SEG-005
- confianza: gap

### REQ-SEG-006 [should] Ver la contraseña al escribirla
El login DEBE ofrecer un botón para mostrar u ocultar la contraseña escrita, oculta por defecto.
- Escenario: Dado el formulario de login con una contraseña escrita, Cuando se pulsa el botón de mostrar, Entonces el campo muestra el texto, y al pulsarlo de nuevo vuelve a ocultarlo.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-SEG-007 [should] Avisos dentro de la página, nunca del navegador
El sistema NO DEBE usar alert, confirm ni los globos de validación del navegador: los errores de un campo DEBEN verse como texto debajo del campo y las confirmaciones DEBEN ser un modal propio.
- Escenario: Dado el login con los campos vacíos, Cuando se pulsa Entrar, Entonces aparece "Completá este campo." debajo del campo y el campo queda marcado como inválido.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado
