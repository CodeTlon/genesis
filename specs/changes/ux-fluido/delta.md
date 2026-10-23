---
capacidad: PAC
perfil: S2
---
# Delta: UX fluida (pestañas de ficha, búsqueda en vivo, firma de un toque)

Objetivo: menos información por pantalla y menos pasos para usuarias +35, sin cambiar datos ni esquema.

## ADDED

### REQ-PAC-006 [must] Ficha organizada en pestañas
El sistema DEBE mostrar la ficha del paciente en pestañas (Casos, Antecedentes, Datos, Consentimientos), una por vez, y DEBE conservar la pestaña activa en el parámetro `tab` de la URL.
- Escenario: Dada la ficha de un paciente, Cuando se abre `?tab=antecedentes`, Entonces se muestra solo el panel de Antecedentes.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-PAC-007 [must] Búsqueda en vivo de pacientes
El sistema DEBE filtrar la lista de pacientes mientras se escribe, sin pulsar un botón, y DEBERÍA seguir funcionando por envío de formulario sin JavaScript.
- Escenario: Dada la lista con dos pacientes, Cuando se escribe parte de un apellido, Entonces solo queda visible el paciente que coincide.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-EVO-006 [must] Firma accesible de un toque
El sistema DEBE ofrecer, además de mantener presionado, un botón "Firmar" que abre una confirmación explícita y firma al aceptar.
- Escenario: Dada una evolución en borrador, Cuando se pulsa Firmar y se confirma, Entonces la evolución queda firmada.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-EVO-007 [must] Zonas del mapa operables con teclado
El sistema DEBE permitir elegir y marcar una zona del mapa de pies solo con teclado, y cerrar el panel de la zona con Escape.
- Escenario: Dado el mapa de pies, Cuando se enfoca una zona y se pulsa Enter, Entonces se abre el panel de la zona, y con Escape se cierra.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado
