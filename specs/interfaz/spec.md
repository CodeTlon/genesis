---
capacidad: INT
perfil: S2
rutas: apps/web/src/app/(panel), apps/web/src/panel/components, packages/config/tokens.css
---
# Interfaz en cualquier dispositivo y volumen

El panel se usa desde el celular, la tableta y la computadora, con pocos o muchos datos y con pacientes de muy distinto tipo.

## Requisitos

### REQ-INT-001 [must] Sin desbordes en ningún tamaño de pantalla
El sistema DEBE mostrar todas las pantallas del panel sin scroll horizontal y sin errores de la página en ancho de celular (390 px), tableta (768 px) y escritorio (1440 px).
- Escenario: Dado un sistema con cientos de pacientes y un paciente con nombres muy largos y un caso de 40 evoluciones, Cuando se recorren inicio, pacientes, casos, atenciones, ficha, caso, evolución e historia en los tres anchos, Entonces ninguna pantalla desborda en horizontal ni produce errores.
- verify: e2e e2e/dispositivos.spec.ts
- confianza: confirmado

### REQ-INT-002 [must] Paginación en los listados
El sistema DEBE paginar en el servidor los listados de pacientes, casos abiertos, atenciones, casos de un paciente y evoluciones de un caso, con páginas numeradas, Anterior y Siguiente, el rango mostrado y el total, y DEBE conservar la búsqueda o la pestaña al cambiar de página.
- Escenario: Dado más de 25 pacientes cargados, Cuando se abre la lista de pacientes, Entonces se muestran 25 con "Mostrando 1–25 de N", y Siguiente lleva a la página 2 con "Mostrando 26–50 de N".
- verify: e2e e2e/dispositivos.spec.ts
- confianza: confirmado

### REQ-INT-003 [must] Cada resumen del inicio lleva a su propia pantalla
El sistema DEBE llevar cada tarjeta del inicio (pacientes, casos abiertos, sin firmar, firmadas del mes) a una pantalla distinta con su propio título.
- Escenario: Dado el inicio con datos, Cuando se pulsa cada tarjeta, Entonces se abren respectivamente Pacientes, Casos abiertos y Atenciones (en la pestaña sin firmar y en la de firmadas).
- verify: e2e e2e/dispositivos.spec.ts
- confianza: confirmado
