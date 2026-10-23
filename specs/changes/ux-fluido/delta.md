---
capacidad: PAC
perfil: S2
---
# Delta: UX fluida (pestañas de ficha, búsqueda en vivo, firma de un toque)

Objetivo: menos información por pantalla y menos pasos para usuarias +35, sin cambiar datos ni esquema.

## ADDED

### REQ-PAC-006 [must] Ficha organizada en pestañas
El sistema DEBE mostrar la ficha del paciente en pestañas (Casos, Antecedentes, Datos, Consentimientos), una por vez, y DEBE conservar la pestaña activa en el parámetro `tab` de la URL.
- Escenario: Dado un paciente, Cuando se abre `?tab=antecedentes`, Entonces se muestra solo el panel de Antecedentes.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-PAC-007 [must] Búsqueda en vivo de pacientes
El sistema DEBE filtrar la lista de pacientes mientras se escribe, sin pulsar un botón, y DEBERÍA seguir funcionando por envío de formulario sin JavaScript.
- Escenario: Dado que hay dos pacientes, Cuando se escribe parte de un apellido, Entonces solo queda visible el paciente que coincide.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado
