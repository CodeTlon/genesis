---
capacidad: HC
perfil: S1
rutas: apps/panel/src/app/(app)/pacientes, apps/panel/src/lib/templates.ts, apps/panel/src/lib/store.ts, apps/panel/src/components/template-form.tsx
---
# Historia clínica: atenciones, firma y adendas

Reemplaza la agenda y la ficha en papel de la profesional: cada paciente tiene su historia con antecedentes, tratamientos y evolución. Las plantillas (A anamnesis, B podología, C láser) son **propuestas a validar con la profesional**, no protocolos oficiales (ADR-006).

## Requisitos

### REQ-HC-001 [must] Antecedentes como checklist
El sistema DEBE ofrecer en la anamnesis un checklist de antecedentes (diabetes, hipertensión, cardiopatía, circulación, neuropatía, tiroides, inmunosupresión, anticoagulantes, epilepsia, infecciosas), alergias y medicación actual, más texto libre.
- Escenario: Dado una anamnesis nueva, Cuando se abre la plantilla A, Entonces están esos campos y la medicación admite texto.
- verify: e2e e2e/panel.spec.ts
- confianza: inferido

### REQ-HC-002 [must] Chart by exception
El sistema DEBE precargar en una atención de seguimiento los valores de la última atención firmada de la misma plantilla y avisarlo.
- Escenario: Dado un paciente con una atención B firmada, Cuando se abre una nueva atención B, Entonces aparece "Cargamos los valores de la última visita".
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-HC-003 [must] Borrador y firma
El sistema DEBE guardar un borrador automáticamente y permitir firmar la atención manteniendo apretado el botón; al firmar DEBE confirmar "Atención firmada y guardada".
- Escenario: Dado una atención en borrador, Cuando se mantiene apretada la firma ~1 s, Entonces queda firmada.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-HC-004 [must] Una atención firmada no se edita
El sistema NO DEBE permitir editar una atención firmada; la corrección DEBE hacerse con una adenda que lleve motivo, texto, autor y fecha.
- Escenario: Dado una atención firmada, Cuando se intenta editar, Entonces el sistema dice "Esta atención ya está firmada"; con "Agregar adenda" queda "Motivo: ..." visible.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-HC-005 [should] Próximo turno sugerido
El sistema DEBERÍA sugerir los días hasta el próximo control según la plantilla (B 45 días, C 30 días), editables.
- Escenario: Dado una atención B firmada, Cuando se pulsa "Agendar próximo turno", Entonces queda un turno pendiente.
- verify: e2e e2e/panel.spec.ts
- confianza: inferido

### REQ-HC-006 [must] Conclusión y sugerencias
El sistema DEBE permitir registrar en cada atención una conclusión y sugerencias al paciente, que se firman con la atención.
- Escenario: Dado una atención en borrador, Cuando se completan y se firma, Entonces quedan visibles y no se editan sin adenda.
- verify: e2e e2e/historias.spec.ts
- confianza: confirmado

### REQ-HC-007 [must] Antecedentes patológicos de la ficha
El sistema DEBE ofrecer los 18 antecedentes de la ficha con Sí/No (alérgicos, anticoagulantes, artritis, cardiovascular, dermatológicos, presión arterial, respiratorio, traumatológicos, colesterol, infecto-contagiosas, antiagregados, artrosis, marcapasos, neurológicos, vasculares, cirugías, reumatológicos, triglicéridos), antecedentes familiares y otros, y el bloque de diabetes (tipo, tiempo de evolución, úlceras, complicaciones, tratamiento).
- Escenario: Dado una primera consulta, Cuando se abre la ficha inicial, Entonces están todos esos campos.
- verify: e2e e2e/historias.spec.ts
- confianza: confirmado

### REQ-HC-008 [must] Antecedentes que levantan alertas
El sistema DEBE actualizar las alertas visibles del paciente cuando la ficha marca alérgicos, anticoagulantes, antiagregados, marcapasos, diabetes, embarazo o lactancia.
- Escenario: Dado un paciente sin alertas, Cuando se firma una ficha con "Anticoagulantes: Sí", Entonces la ficha y "Hoy" muestran "Anticoagulantes".
- verify: e2e e2e/historias.spec.ts
- confianza: confirmado

### REQ-HC-009 [must] Calzado y examen exploratorio por pie
El sistema DEBE registrar el calzado (N°, tacos, tipo, desgaste de cada pie, plantillas) y el examen de cada pie: temperatura, humedad, pulso pedio, coloración, textura, edema, inflamación, más pedigrafía, radiografías y podoscopio.
- Escenario: Dado la ficha inicial, Cuando se completa el examen, Entonces los valores del pie derecho y del izquierdo quedan separados.
- verify: e2e e2e/historias.spec.ts
- confianza: confirmado

### REQ-HC-010 [must] Patologías por dedo y zona
El sistema DEBE registrar dactilopatías, onicopatías, helomas, dermatopatías y patologías varias por dedo (1° a 5°) de cada pie, y las zonas plantar, dorsal, interdigital y pierna donde corresponde.
- Escenario: Dado una atención, Cuando se anota un heloma en el 2° dedo derecho, Entonces queda en la historia con su pie y dedo.
- verify: e2e e2e/historias.spec.ts
- confianza: confirmado

### REQ-HC-011 [must] Tratamiento, indicaciones y control
El sistema DEBE registrar en cada atención tratamiento preventivo, tratamiento realizado, indicaciones y control (próxima visita).
- Escenario: Dado una atención, Cuando se completan esos cuatro campos y se firma, Entonces se ven en la historia.
- verify: e2e e2e/historias.spec.ts
- confianza: confirmado

### REQ-HC-012 [must] Historias en Postgres
El sistema DEBE guardar pacientes, atenciones y adendas en Postgres; reiniciar el panel NO DEBE perder datos.
- Escenario: Dado una atención firmada, Cuando se reinicia el panel, Entonces la atención sigue en la historia.
- verify: e2e e2e/historias.spec.ts
- confianza: confirmado

<!-- Alcance (decisión 18/10): por ahora solo historias clínicas. Agenda, turnos, WhatsApp simulado y sitio quedan fuera: no se agregan REQ ni se desarrollan hasta nueva decisión de Inés. -->
