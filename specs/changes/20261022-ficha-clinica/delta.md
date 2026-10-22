# Delta: ficha-clinica

## ADDED

### REQ-PAC-005 [must] Ocupación y contacto de emergencia
El sistema DEBE guardar y mostrar en la ficha la ocupación del paciente y un contacto de emergencia (nombre y teléfono).
- Escenario: Dado un paciente nuevo, Cuando se cargan ocupación y contacto de emergencia, Entonces la ficha los muestra.
- verify: e2e e2e/historias.spec.ts

### REQ-PAC-006 [should] Campos de la ficha de Inés
El sistema DEBERÍA ajustar los campos de la ficha a la que Inés usaba cuando estudió, una vez que mande la foto de referencia.
- Escenario: Dado la foto de la ficha, Cuando se compara con la ficha del panel, Entonces cada campo de ella existe o queda descartado por escrito.
- verify: manual MANUAL-PRUEBAS.md#REQ-PAC-006

### REQ-HC-006 [must] Conclusión y sugerencias
El sistema DEBE permitir registrar en cada atención una conclusión y sugerencias al paciente, que se firman con la atención.
- Escenario: Dado una atención en borrador, Cuando se completan conclusión y sugerencias y se firma, Entonces quedan visibles en la historia y no se editan sin adenda.
- verify: e2e e2e/historias.spec.ts

### REQ-HC-007 [must] Antecedentes que levantan alertas
El sistema DEBE actualizar las alertas visibles del paciente cuando la anamnesis marca diabetes, anticoagulantes, alergias, embarazo o lactancia, o marcapasos.
- Escenario: Dado un paciente sin alertas, Cuando se firma una anamnesis con "Anticoagulantes", Entonces la ficha y "Hoy" muestran "Anticoagulantes".
- verify: e2e e2e/historias.spec.ts

### REQ-HC-008 [must] Historias en Postgres
El sistema DEBE guardar pacientes, atenciones y adendas en Postgres; reiniciar el panel NO DEBE perder datos.
- Escenario: Dado una atención firmada, Cuando se reinicia el servidor del panel, Entonces la atención sigue en la historia.
- verify: e2e e2e/historias.spec.ts

### REQ-MAP-003 [must] Forma de pie
El sistema DEBE permitir elegir para cada pie la forma romano, griego o egipcio y guardarla en la atención junto con las marcas.
- Escenario: Dado el mapa de una atención B, Cuando se elige "griego" para el pie izquierdo y se firma, Entonces la historia muestra "Izq.: griego".
- verify: e2e e2e/historias.spec.ts
