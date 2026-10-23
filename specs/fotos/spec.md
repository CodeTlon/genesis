---
capacidad: FOT
perfil: S2
rutas: apps/panel/src/components/photo-section.tsx, apps/panel/src/lib/photo-actions.ts, apps/panel/src/app/fotos
---
# Fotos clínicas

Fotos de la primera consulta y de la evolución de cada paciente. Son dato de salud: con consentimiento, cifradas y solo con sesión.

## Requisitos

### REQ-FOT-001 [must] Fotos de la primera consulta y de la evolución
El sistema DEBE permitir adjuntar fotos a un paciente (y opcionalmente a una atención), marcadas como "primera consulta" o "evolución", y verlas ordenadas por fecha en la historia.
- Escenario: Dado un paciente con consentimiento, Cuando se suben una foto inicial y otra de evolución, Entonces la historia las lista por fecha con su etiqueta.
- verify: e2e e2e/fotos.spec.ts
- confianza: confirmado

### REQ-FOT-002 [must] Consentimiento antes de fotografiar
El sistema NO DEBE permitir subir fotos de un paciente sin el consentimiento de imagen clínica vigente; la base también lo exige.
- Escenario: Dado un paciente con consentimiento pendiente, Cuando se intenta subir una foto, Entonces se rechaza con un aviso.
- verify: e2e e2e/fotos.spec.ts
- confianza: confirmado

### REQ-FOT-003 [must] Fotos solo con sesión
El sistema NO DEBE servir una foto a quien no tiene sesión; las fotos NO DEBEN estar en una carpeta pública.
- Escenario: Dado la URL de una foto, Cuando se pide sin sesión, Entonces redirige a `/login`.
- verify: e2e e2e/fotos.spec.ts
- confianza: confirmado
