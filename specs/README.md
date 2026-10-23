---
sdd: v1
perfil: S2
---
# Specs de Genesis

Método: SDD CodeTlon (`sdd: v1`). Validador: `node scripts/spec-lint.mjs` (corre en CI). Perfil **S2 (bloqueante)**: el sistema ya es real, así que todo requisito tiene su verificación. Alcance: **solo historias clínicas** (ADR-016).

| Capacidad | Archivo | REQ | Estado |
|-----------|---------|-----|--------|
| PAC pacientes | `pacientes/spec.md` | 5 | vigente |
| ANT antecedentes y alertas | `antecedentes/spec.md` | 3 | vigente |
| CAS casos | `casos/spec.md` | 1 | vigente |
| EVO evoluciones | `evoluciones/spec.md` | 7 | vigente |
| FOT fotos clínicas | `fotos/spec.md` | 3 | vigente |
| SEG seguridad | `seguridad/spec.md` | 5 | vigente (1 gap) |

## Cambios abiertos
Ninguno.

## Brechas conocidas
- **REQ-SEG-005**: falta el simulacro de restauración contra B2 real (`docs/restauraciones.md`). Hasta entonces NO se cargan pacientes reales.

## Reglas rápidas
- Bugfix, contenido, dependencias: sin spec. Un cambio de comportamiento abre un delta en `changes/` antes de implementarse.
- Los tests llevan `[REQ-XXX-NNN]` en el nombre.
- Las plantillas clínicas son propuestas a validar con la profesional.
