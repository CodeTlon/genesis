---
capacidad: MAP
perfil: S1
rutas: apps/panel/src/components/foot-map.tsx
---
# Mapa de pies

Sirve para marcar en el pie las patologías (durezas, callos, fisuras) y qué se va a tratar. Hoy marca zonas por lado y vista; las formas de pie romano, griego y egipcio que pidió Inés están en `changes/20261022-ficha-clinica/`.

## Requisitos

### REQ-MAP-001 [must] Marcar un hallazgo en una zona
El sistema DEBE permitir marcar en el mapa una zona de un pie (izquierdo o derecho, vista plantar o dorsal) con un hallazgo y una gravedad (leve, moderada, intensa) y una nota opcional.
- Escenario: Dado el mapa en una atención B, Cuando se toca "Pie derecho, Talón" y se elige Fisura, Intensa, Entonces se lista "Der. · Talón: Fisura (Intensa)".
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-MAP-002 [must] Las marcas viajan con la atención
El sistema DEBE guardar las marcas dentro de la atención y dejarlas inmutables al firmar, como el resto de la atención.
- Escenario: Dado una atención firmada con marcas, Cuando se vuelve a abrir, Entonces las marcas siguen y no se pueden cambiar sin adenda.
- verify: e2e e2e/panel.spec.ts
- confianza: inferido
