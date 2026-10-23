---
capacidad: EVO
perfil: S2
---
# Delta: UX fluida en evoluciones (firma de un toque, mapa por teclado)

## ADDED

### REQ-EVO-006 [must] Firma accesible de un toque
El sistema DEBE ofrecer, además de mantener presionado, un botón "Firmar" que abre una confirmación explícita y firma al aceptar.
- Escenario: Dado un borrador de evolución, Cuando se pulsa Firmar y se confirma, Entonces la evolución queda firmada.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-EVO-007 [must] Zonas del mapa operables con teclado
El sistema DEBE permitir elegir y marcar una zona del mapa de pies solo con teclado, y cerrar el panel de la zona con Escape.
- Escenario: Dado el mapa de pies, Cuando se enfoca una zona y se pulsa Enter, Entonces se abre el panel de la zona, y con Escape se cierra.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado
