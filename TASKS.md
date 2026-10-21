# Tasks — Genesis (historias clínicas de podología)

## Hecho
- [x] Base real: Postgres, login (Better Auth), cifrado de campos clínicos, auditoría, inmutabilidad en la base
- [x] Pacientes, antecedentes con alertas, casos (conclusión y sugerencias), evoluciones firmadas + adendas
- [x] Mapa de pies v2 (egipcio / griego / romano, a tratar / tratado)
- [x] Fotos clínicas privadas + consentimientos; historia imprimible / PDF
- [x] Docker + compose de Coolify, backup y simulacro (scripts), health
- [x] Sin sitio público ni CMS (ADR-016)

## Antes de cargar pacientes reales
- [ ] Simulacro de restauración contra B2 real, fechado en `docs/restauraciones.md`
- [ ] Deploy en Coolify (`test` y `main`) con secretos propios; `CLINICAL_DATA_ENCRYPTION_KEY` guardada aparte
- [ ] Validar con Inés: antecedentes, lesiones, zonas del mapa, otros tipos de pie
- [ ] Texto de consentimiento revisado por una persona con matrícula; consulta AAIP

## Después
- [ ] 2FA y rotación de la clave de cifrado
- [ ] Limpiar tablas heredadas sin uso (`areas`, `professionals`, `form_templates*`) cuando se pueda soltar su FK en `clinical_entries`
