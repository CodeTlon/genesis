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

<!-- Alcance (decisión 18/10): por ahora solo historias clínicas. Agenda, turnos, WhatsApp simulado y sitio quedan fuera: no se agregan REQ ni se desarrollan hasta nueva decisión de Inés. -->
