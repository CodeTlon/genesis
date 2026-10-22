---
sdd: v1
perfil: S1
---
# Specs de Genesis

Método: SDD CodeTlon (`sdd: v1`). Validador: `node scripts/spec-lint.mjs`. Perfil **S1 (avisos)** porque el proyecto está en desarrollo; **subir a S2** cuando los deltas abiertos tengan sus tests. Alcance vigente (decisión 18/10): **solo historias clínicas**; agenda, turnos, WhatsApp y sitio no se desarrollan hasta nueva decisión de Inés.

| Capacidad | Archivo | REQ | Estado |
|-----------|---------|-----|--------|
| PAC pacientes y alertas | `pacientes/spec.md` | 6 | vigente |
| HC historia clínica | `historia-clinica/spec.md` | 12 | vigente |
| MAP mapa de pies | `mapa-pies/spec.md` | 3 | vigente |
| SEG seguridad y acceso | `seguridad/spec.md` | 2 | vigente |

## Cambios abiertos
- `changes/20261022-fotos-y-seguridad/`: fotos de consulta y evolución, usuarios con 2FA, cifrado, auditoría, backups.

Cerrados en `_archive/`: `20261022-ficha-clinica` (ficha de Inés, mapa con forma de pie, historias en Postgres).

## Reglas rápidas
- Bugfix, contenido, dependencias: sin spec.
- Los tests llevan `[REQ-XXX-NNN]` en el nombre.
- Las plantillas clínicas son propuestas a validar con la profesional (ADR-006).
