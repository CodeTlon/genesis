---
capacidad: SEG
perfil: S2
rutas: apps/panel/src/middleware.ts, apps/panel/src/app/login, apps/panel/src/lib/auth.ts, apps/panel/src/lib/crypto.ts, apps/panel/src/lib/session.ts
---
# Seguridad y acceso al panel

Una historia clínica es dato de salud: entra solo quien tiene usuario, el contenido va cifrado, cada acceso queda registrado y hay backup verificado. Decisión 22/10: sin segundo factor (2FA) por ahora; queda como mejora futura.

## Requisitos

### REQ-SEG-001 [must] Panel protegido
El sistema DEBE redirigir a `/login` a quien no tiene sesión y avisar "no son correctos" ante un usuario o clave inválidos.
- Escenario: Dado un visitante sin sesión, Cuando abre `/pacientes`, Entonces termina en `/login`; con clave "mala" el formulario avisa.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-SEG-002 [must] Sin datos clínicos en el navegador
El sistema NO DEBE guardar datos clínicos en `localStorage` ni cargar trackers o CDNs de terceros.
- Escenario: Dado un paciente abierto, Cuando se inspecciona el almacenamiento del navegador, Entonces no hay datos clínicos.
- verify: manual MANUAL-PRUEBAS.md#REQ-SEG-002
- confianza: inferido

### REQ-SEG-003 [must] Usuario por profesional
El sistema DEBE pedir usuario y contraseña propios a cada profesional (la contraseña guardada con hash scrypt), firmar la sesión y registrar a nombre de quien entró cada atención.
- Escenario: Dado dos profesionales, Cuando entra Valentina, Entonces el panel muestra "Sesión: Valentina (Estética)"; al salir, las rutas vuelven a pedir ingreso.
- verify: e2e e2e/seguridad.spec.ts
- confianza: confirmado

### REQ-SEG-004 [must] Contenido clínico cifrado
El sistema DEBE guardar el contenido clínico (atenciones, adendas, fotos) cifrado en la base con AES-256-GCM, con la clave fuera del repo.
- Escenario: Dado una atención guardada, Cuando se lee la fila directo en la base, Entonces el contenido no es legible.
- verify: contract tests/cifrado.test.ts
- confianza: confirmado

### REQ-SEG-005 [must] Registro de accesos
El sistema DEBE registrar quién abrió, creó o corrigió cada historia, con fecha y hora, y ese registro NO DEBE poder editarse ni borrarse.
- Escenario: Dado un profesional que abre una ficha, Cuando se consulta el registro, Entonces figura su usuario y la hora.
- verify: contract tests/auditoria.test.ts
- confianza: confirmado

### REQ-SEG-006 [must] Backups verificados
El sistema DEBE tener backup diario de la base (que incluye las fotos) y una restauración de prueba fechada.
- Escenario: Dado el backup del día, Cuando se restaura en una base vacía, Entonces las historias coinciden con las originales.
- verify: manual MANUAL-PRUEBAS.md#REQ-SEG-006
- confianza: confirmado

### REQ-SEG-007 [should] Bloqueo por intentos fallidos
El sistema DEBERÍA bloquear el ingreso de un usuario durante 5 minutos tras 5 intentos fallidos.
- Escenario: Dado 5 claves incorrectas seguidas, Cuando se intenta de nuevo, Entonces avisa "Demasiados intentos".
- verify: e2e e2e/seguridad.spec.ts
- confianza: confirmado
