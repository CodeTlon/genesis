---
sdd: v1
perfil: S2
---
# Specs de Genesis

Método: SDD CodeTlon (`sdd: v1`). Validador: `node scripts/spec-lint.mjs`. Perfil **S2 (bloqueante)**: todos los requisitos tienen su verificación.

| Capacidad | Archivo | REQ | Estado |
|-----------|---------|-----|--------|
| PAC pacientes y alertas | `pacientes/spec.md` | 6 | vigente |
| HC historia clínica | `historia-clinica/spec.md` | 12 | vigente |
| MAP mapa de pies | `mapa-pies/spec.md` | 3 | vigente |
| FOT fotos clínicas | `fotos/spec.md` | 3 | vigente |
| SEG seguridad y acceso | `seguridad/spec.md` | 7 | vigente |

## Cambios abiertos
Ninguno.

Cerrados en `_archive/`: `20261022-fotos-y-seguridad` (fotos, usuarios, cifrado, accesos, backups), `20261022-ficha-clinica` (ficha de Inés, mapa con forma de pie, historias en Postgres).

## Reglas rápidas
- Bugfix, contenido, dependencias: sin spec.
- Los tests llevan `[REQ-XXX-NNN]` en el nombre.
- Las plantillas clínicas son propuestas a validar con la profesional (ADR-006).
