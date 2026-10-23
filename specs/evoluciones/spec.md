---
capacidad: EVO
perfil: S2
rutas: apps/web/src/panel/lib/repo.ts, apps/web/src/panel/lib/templates.ts, apps/web/src/panel/components/attention-form.tsx, apps/web/src/panel/components/foot-map.tsx, apps/web/src/panel/components/entry-view.tsx
---
# Evoluciones podológicas

Cada visita se registra como una evolución dentro de un caso: borrador automático, firma y corrección solo por adenda. La plantilla es una propuesta a validar con Inés.

## Requisitos

### REQ-EVO-001 [must] Evolución con mapa de pies y firma
El sistema DEBE guardar un borrador automáticamente, permitir marcar hallazgos en el mapa de pies con el tipo de pie (egipcio, griego o romano) y firmar manteniendo presionado el botón.
- Escenario: Dado una evolución en borrador con una marca en el dedo 1 derecho, Cuando se mantiene presionada la firma, Entonces se confirma "Evolución firmada" y el caso muestra el tipo de pie.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-EVO-002 [must] Una evolución firmada no se edita
El sistema NO DEBE permitir editar ni borrar una evolución firmada (la base lo impide por trigger); la corrección DEBE hacerse con una adenda con motivo, texto, autor y fecha, que tampoco se edita.
- Escenario: Dado una evolución firmada, Cuando se agrega una adenda, Entonces queda visible con su motivo; un UPDATE directo a la base falla.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-EVO-003 [must] Contenido clínico cifrado
El sistema DEBE guardar cifrados (AES-256-GCM) el payload de las evoluciones, las adendas, el motivo y la conclusión de los casos y las notas de antecedentes.
- Escenario: Dado una evolución guardada, Cuando se lee la fila directo en la base, Entonces el contenido no es legible.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-EVO-004 [must] Historia clínica imprimible
El sistema DEBE ofrecer la historia clínica completa del paciente para imprimir o guardar como PDF.
- Escenario: Dado un paciente con evoluciones, Cuando se abre su historia, Entonces se ven sus datos y las marcas del mapa de pies.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-EVO-005 [must] Examen, patologías por dedo, tratamiento y control
El sistema DEBE registrar en la evolución el examen de cada pie (temperatura, humedad, coloración, textura, edema, inflamación), patologías por dedo (dactilopatías, onicopatías, helomas, dermatopatías y varias), tratamiento preventivo y control.
- Escenario: Dado una evolución, Cuando se anota un heloma en el 2° dedo derecho y se firma, Entonces el caso muestra "Der.: 2° Heloma dorsal".
- verify: e2e e2e/ficha.spec.ts
- confianza: confirmado
