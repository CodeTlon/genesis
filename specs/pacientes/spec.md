---
capacidad: PAC
perfil: S1
rutas: apps/panel/src/app/(app)/pacientes, apps/panel/src/lib/store.ts, apps/panel/src/lib/types.ts
---
# Pacientes: ficha base y alertas

La profesional encuentra a un paciente rápido y ve sus datos básicos y las alertas de precaución en la ficha. Lo que ya existe en el panel; lo que pidió Inés y falta está en `changes/20261022-ficha-clinica/`.

## Requisitos

### REQ-PAC-001 [must] Datos básicos del paciente
El sistema DEBE guardar de cada paciente nombre, apellido, DNI, fecha de nacimiento, teléfono, domicilio y obra social.
- Escenario: Dado un paciente cargado, Cuando se abre su ficha, Entonces se ven esos datos.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-PAC-002 [must] Búsqueda tolerante
El sistema DEBE encontrar pacientes por nombre, apellido, DNI o teléfono ignorando tildes y tolerando errores de tipeo; sin resultados DEBE decir "No encontramos pacientes".
- Escenario: Dado el listado de pacientes, Cuando se busca "sanchez" o "ledesna", Entonces aparecen Roberto Sánchez y Norma Ledesma; con "zzzz" aparece el aviso.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-PAC-003 [must] Alertas visibles con texto
El sistema DEBE mostrar las alertas del paciente (diabetes, anticoagulantes, embarazo o lactancia, marcapasos o implantes, alergia, menor de edad) con texto, no solo con color o ícono.
- Escenario: Dado un paciente con anticoagulantes, Cuando se abre "Hoy" o su ficha, Entonces se lee "Anticoagulantes".
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-PAC-004 [must] Tutor obligatorio si es menor
El sistema DEBERÍA exigir el nombre del tutor cuando el paciente es menor de 18 años.
- Escenario: Dado un paciente nacido hace 10 años, Cuando se guarda sin tutor, Entonces se rechaza con un aviso.
- verify: e2e e2e/panel.spec.ts
- confianza: gap

<!-- Gap: el esquema (0001_init.sql) dice "validar en app" y el tipo tiene `guardian` obligatorio solo por comentario; no hay test que lo verifique. -->
