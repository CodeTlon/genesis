# Delta: ficha-clinica

Base: la ficha de papel de Inés ("Historia clínica podológica", 4 hojas; fotos del 20/10, no versionadas porque traen datos de una paciente real).

## ADDED

### REQ-PAC-005 [must] Datos de la ficha
El sistema DEBE guardar y mostrar de cada paciente fecha de primera consulta, nacionalidad, sexo, estatura, peso, grupo sanguíneo, actividad laboral y otras actividades, además de un contacto de emergencia opcional.
- Escenario: Dado un paciente nuevo, Cuando se cargan esos datos, Entonces la ficha los muestra.
- verify: e2e e2e/historias.spec.ts

### REQ-HC-006 [must] Conclusión y sugerencias
El sistema DEBE permitir registrar en cada atención una conclusión y sugerencias al paciente, que se firman con la atención.
- Escenario: Dado una atención en borrador, Cuando se completan y se firma, Entonces quedan visibles y no se editan sin adenda.
- verify: e2e e2e/historias.spec.ts

### REQ-HC-007 [must] Antecedentes patológicos de la ficha
El sistema DEBE ofrecer los 18 antecedentes de la ficha con Sí/No (alérgicos, anticoagulantes, artritis, cardiovascular, dermatológicos, presión arterial, respiratorio, traumatológicos, colesterol, infecto-contagiosas, antiagregados, artrosis, marcapasos, neurológicos, vasculares, cirugías, reumatológicos, triglicéridos), antecedentes familiares y otros, y el bloque de diabetes (tipo, tiempo de evolución, úlceras, complicaciones, tratamiento).
- Escenario: Dado una primera consulta, Cuando se abre la ficha inicial, Entonces están todos esos campos.
- verify: e2e e2e/historias.spec.ts

### REQ-HC-008 [must] Antecedentes que levantan alertas
El sistema DEBE actualizar las alertas visibles del paciente cuando la ficha marca alérgicos, anticoagulantes, antiagregados, marcapasos, diabetes, embarazo o lactancia.
- Escenario: Dado un paciente sin alertas, Cuando se firma una ficha con "Anticoagulantes: Sí", Entonces la ficha y "Hoy" muestran "Anticoagulantes".
- verify: e2e e2e/historias.spec.ts

### REQ-HC-009 [must] Calzado y examen exploratorio por pie
El sistema DEBE registrar el calzado (N°, tacos, tipo, desgaste de cada pie, plantillas) y el examen de cada pie: temperatura, humedad, pulso pedio, coloración, textura, edema, inflamación, más pedigrafía, radiografías y podoscopio.
- Escenario: Dado la ficha inicial, Cuando se completa el examen, Entonces los valores del pie derecho y del izquierdo quedan separados.
- verify: e2e e2e/historias.spec.ts

### REQ-HC-010 [must] Patologías por dedo y zona
El sistema DEBE registrar dactilopatías, onicopatías, helomas, dermatopatías y patologías varias por dedo (1° a 5°) de cada pie, y las zonas plantar, dorsal, interdigital y pierna donde corresponde.
- Escenario: Dado una atención, Cuando se anota un heloma en el 2° dedo derecho, Entonces queda en la historia con su pie y dedo.
- verify: e2e e2e/historias.spec.ts

### REQ-HC-011 [must] Tratamiento, indicaciones y control
El sistema DEBE registrar en cada atención tratamiento preventivo, tratamiento realizado, indicaciones y control (próxima visita).
- Escenario: Dado una atención, Cuando se completan esos cuatro campos y se firma, Entonces se ven en la historia.
- verify: e2e e2e/historias.spec.ts

### REQ-HC-012 [must] Historias en Postgres
El sistema DEBE guardar pacientes, atenciones y adendas en Postgres; reiniciar el panel NO DEBE perder datos.
- Escenario: Dado una atención firmada, Cuando se reinicia el panel, Entonces la atención sigue en la historia.
- verify: e2e e2e/historias.spec.ts

### REQ-MAP-003 [must] Forma de pie (fórmula digital)
El sistema DEBE permitir elegir para cada pie la forma griego, egipcio o romano (cuadrado o polinesio, como figura en la ficha) y guardarla en la atención.
- Escenario: Dado el mapa, Cuando se elige "griego" para el pie izquierdo y se firma, Entonces la historia muestra "Izq.: griego".
- verify: e2e e2e/historias.spec.ts
