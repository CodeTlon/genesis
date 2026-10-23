# Tasks — Genesis (historias clínicas de podología)

## Hecho
- [x] Base real: Postgres, login (Better Auth), cifrado de campos clínicos, auditoría, inmutabilidad en la base
- [x] Pacientes, antecedentes con alertas, casos (conclusión y sugerencias), evoluciones firmadas + adendas
- [x] Mapa de pies v2 (egipcio / griego / romano, a tratar / tratado)
- [x] Fotos clínicas privadas (sin módulo de consentimientos, ADR-019); historia imprimible / PDF
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

## 23/10 — SDD y ficha de Inés
- [x] Specs (S2, 20 REQ), spec-lint y CI con E2E
- [x] Ficha: datos del paciente, 18 antecedentes + diabetes, examen por pie, patologías por dedo, tratamiento preventivo y control
- [ ] Confirmar con Inés que "romano" = "cuadrado/polinesio" y validar los campos nuevos
- [ ] Simulacro de restauración contra B2 (REQ-SEG-005) antes de cargar pacientes reales
- [ ] Legal: conservación de la historia, texto del consentimiento revisado por matriculado, inscripción AAIP

## 23/10 — UX fluida (ADR-018)
- [x] Tokens semánticos, toasts, errores enfocados, nav móvil con safe-area, esqueletos por pantalla
- [x] Ficha en pestañas, lectura/edición, lista con búsqueda en vivo
- [x] Mapa de pies: hoja modal, área de toque >= 44 px, insignias de gravedad, miniatura de solo lectura
- [x] Firma de un toque con confirmación; aviso de cambios sin guardar
- [ ] Probar en un celular real y con Inés (tamaños, firma, mapa); ajustar según lo que diga
- [ ] Deploy real en Coolify con dominio (no verificado desde acá)
