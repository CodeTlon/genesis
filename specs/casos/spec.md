---
capacidad: CAS
perfil: S2
rutas: apps/web/src/panel/lib/repo.ts, apps/web/src/app/(panel)/panel/(app)/pacientes/[id]/casos
---
# Casos y tratamientos

Cada problema a tratar es un caso con sus evoluciones; se cierra con una conclusión y sugerencias para el paciente.

## Requisitos

### REQ-CAS-001 [must] Abrir y cerrar casos con conclusión
El sistema DEBE permitir abrir un caso con título y motivo, y cerrarlo con una conclusión obligatoria y sugerencias opcionales; un caso cerrado NO DEBE aceptar evoluciones nuevas hasta reabrirlo.
- Escenario: Dado un caso abierto, Cuando se cierra con conclusión, Entonces se ven la conclusión y las sugerencias y desaparece "Nueva evolución".
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado
