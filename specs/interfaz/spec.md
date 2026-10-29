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
El sistema DEBE llevar cada tarjeta del inicio (pacientes, casos abiertos, borradores sin firmar y atenciones de hoy) a un listado distinto, y el número de cada tarjeta DEBE coincidir con el total que muestra ese listado.
- Escenario: Dado el inicio con datos, Cuando se pulsa cada tarjeta, Entonces se abre el listado correspondiente (Pacientes, Casos, Atenciones con borradores y Atenciones de hoy) y su total es el mismo número de la tarjeta.
- verify: e2e e2e/dispositivos.spec.ts
- confianza: confirmado

### REQ-INT-004 [must] Alertas clínicas en una tarjeta ordenada
El sistema DEBE mostrar las alertas clínicas del paciente en una sola tarjeta, ordenadas de la más grave a la menos grave, cada una con ícono, nombre y qué implica, y DEBE mostrar las tres más graves con un botón para ver todas si hay más.
- Escenario: Dado un paciente con cinco alertas, Cuando se abre su ficha, Entonces la tarjeta indica (5), muestra tres y "Ver todas (5)" muestra las cinco.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-INT-005 [should] Búsqueda rápida desde cualquier pantalla
El sistema DEBE ofrecer una búsqueda rápida que se abra con la tecla barra inclinada o Ctrl+K, encuentre pacientes mientras se escribe, permita elegir con flechas y Enter, se cierre con Escape y exija sesión.
- Escenario: Dado un paciente cargado, Cuando se pulsa la barra inclinada y se escribe su apellido, Entonces aparece como resultado y Enter abre su ficha; sin sesión la búsqueda responde 401.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-INT-006 [should] Evoluciones como línea de tiempo
El sistema DEBE mostrar las evoluciones de un caso como una línea de tiempo con fecha, autora, estado y motivo, con la más reciente abierta y las demás plegadas.
- Escenario: Dado un caso con varias evoluciones, Cuando se abre el caso, Entonces la más reciente muestra su detalle y las anteriores muestran solo el resumen hasta que se abren.
- verify: e2e e2e/dispositivos.spec.ts
- confianza: confirmado

### REQ-INT-007 [should] Comparador de fotos antes y después
El sistema DEBE ofrecer un comparador con deslizador entre la foto inicial y la final de un caso, operable con teclado.
- Escenario: Dado un caso con foto inicial y final, Cuando se mueve el deslizador, Entonces se ve más o menos de cada foto.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-INT-008 [must] Accesibilidad sin problemas graves
El sistema NO DEBE tener problemas graves de accesibilidad (WCAG 2.1 A y AA según la revisión automática) en el login, el inicio, los listados, la ficha, el caso, la evolución y la búsqueda rápida, en celular y escritorio.
- Escenario: Dado el sistema con datos, Cuando se revisan esas pantallas con la herramienta de accesibilidad, Entonces no aparecen problemas serios ni críticos.
- verify: e2e e2e/accesibilidad.spec.ts
- confianza: confirmado

### REQ-INT-009 [must] Filtros en los listados
El sistema DEBE permitir filtrar con desplegables, además de buscar por texto, el listado de pacientes (con alertas, con caso abierto, sin casos, menores, tipo de alerta y orden), el de casos (abiertos, cerrados o todos, con borradores y orden) y el de atenciones (borradores o firmadas, período y orden); los filtros se resuelven en el servidor, se combinan entre sí, quedan en la URL y vuelven a la primera página al cambiarlos.
- Escenario: Dado seis pacientes de prueba (sin alertas, con diabetes, menor, anticoagulada con caso cerrado, con borrador y con dos casos), Cuando se elige cada filtro y sus combinaciones, Entonces cada listado muestra exactamente los registros esperados, "Limpiar filtros" restablece los desplegables y los números del inicio coinciden con los totales de los listados.
- verify: e2e e2e/filtros.spec.ts
- confianza: confirmado

### REQ-INT-010 [should] Barra de desplazamiento y cursor con la marca
El sistema DEBE mostrar una barra de desplazamiento personalizada con los colores de la marca y, con mouse o trackpad, un cursor propio (flecha para lo general y punto para lo que se puede tocar), sin pedir recursos a terceros y respetando el cursor de texto en los campos.
- Escenario: Dado el login abierto en un navegador de escritorio, Cuando se consulta el estilo de la página, Entonces la barra de desplazamiento mide 14 px, el cursor general es una imagen propia y el del botón Entrar es el cursor de lo clickeable, y el de un campo de texto es el de texto.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado
