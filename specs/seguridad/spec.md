---
capacidad: SEG
perfil: S1
rutas: apps/panel/src/middleware.ts, apps/panel/src/app/login
---
# Seguridad y acceso al panel

Una historia clínica es dato de salud: solo entra quien tiene sesión. Hoy es una clave única de demo; la Fase 1 real (usuarios, 2FA, cifrado, auditoría, backups) está en `changes/20261022-fotos-y-seguridad/`.

## Requisitos

### REQ-SEG-001 [must] Panel protegido
El sistema DEBE redirigir a `/login` a quien no tiene sesión y avisar "no es correcta" ante una clave inválida.
- Escenario: Dado un visitante sin sesión, Cuando abre `/pacientes`, Entonces termina en `/login`; con clave "mala" el formulario avisa.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-SEG-002 [must] Sin datos clínicos en el navegador
El sistema NO DEBE guardar datos clínicos en `localStorage` ni cargar trackers o CDNs de terceros.
- Escenario: Dado un paciente abierto, Cuando se inspecciona el almacenamiento del navegador, Entonces no hay datos clínicos.
- verify: manual MANUAL-PRUEBAS.md#REQ-SEG-002
- confianza: inferido
