---
capacidad: ANT
perfil: S2
rutas: apps/web/src/panel/lib/types.ts, apps/web/src/panel/lib/repo.ts, apps/web/src/panel/components/forms.tsx
---
# Antecedentes y alertas

Lo que Inés marca como "muy importante": los antecedentes del paciente generan alertas visibles con texto en toda la ficha.

## Requisitos

### REQ-ANT-001 [must] Antecedentes versionados que levantan alertas
El sistema DEBE guardar los antecedentes como una versión nueva en cada guardado y mostrar en la cabecera de la ficha una alerta con texto por cada antecedente marcado que la genere.
- Escenario: Dado un paciente sin alertas, Cuando se marca "Diabetes" y se guarda, Entonces la cabecera muestra la alerta "Diabetes".
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-ANT-002 [must] Antecedentes de la ficha en papel
El sistema DEBE ofrecer los antecedentes de la ficha (alérgicos, anticoagulantes, antiagregados, artritis, artrosis, cardiovascular, dermatológicos, presión arterial, respiratorio, traumatológicos, reumatológicos, neurológicos, vasculares, infecto-contagiosas, marcapasos, colesterol, triglicéridos, cirugías, diabetes) y generar alerta con antiagregados.
- Escenario: Dado la ficha de un paciente, Cuando se marca "Antiagregados" y se guarda, Entonces la cabecera muestra "Antiagregados".
- verify: e2e e2e/ficha.spec.ts
- confianza: confirmado

### REQ-ANT-003 [must] Bloque de diabetes y antecedentes familiares
El sistema DEBE registrar tipo de diabetes, tiempo de evolución, úlceras, complicaciones, tratamiento y antecedentes familiares, y conservarlos al recargar.
- Escenario: Dado un paciente con diabetes, Cuando se completa el bloque y se guarda, Entonces al recargar sigue cargado.
- verify: e2e e2e/ficha.spec.ts
- confianza: confirmado
