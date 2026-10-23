# Tasks — Genesis (Fase 0)
## Setup
- [x] Repo GitHub privado CodeTlon/genesis + ramas main y dev (push verificado)
- [x] Turborepo + Next 15.5.25 (build+typecheck+lint verdes)
- [x] Tokens de marca + fuentes (next/font)
- [x] docker-compose + migración 0001 verificada en Postgres 16 real (npm run db:verify: 14 garantías)
## Sitio público
- [x] Inicio, Servicios (19 servicios en 5 páginas por grupo), Nosotros, Galería, Contacto, Pedir turno, Privacidad (sin botón de WhatsApp)
- [x] JSON-LD, sitemap, robots (demo noindex)
## Panel
- [x] Pacientes ficticios, ficha + plantillas A/B/C, mapa de pies, agenda drag&drop, Hoy, WhatsApp simulado, onboarding, plantillas
## Cierre
- [x] Lighthouse móvil (perf 96-98, a11y 100) + axe + 14 E2E verdes + docs/guion-demo.md
- [x] Sitio editable desde el panel (CMS sobre Postgres): 7 E2E + axe verdes
- [ ] Deploy demo (manual de Mateo: Vercel x2 + Postgres administrado + variables de .env.example)
## Historias clínicas reales (SDD, 2026-10-22)
- [x] Specs y deltas (specs/) + ficha de Inés como base
- [x] Pacientes, atenciones y adendas en Postgres (migración 0003; 25 E2E verdes)
- [x] Plantilla F «Ficha podológica inicial», conclusión/sugerencias, forma de pie, alertas desde antecedentes, alta y edición de pacientes
- [ ] Fotos de primera consulta y evolución con consentimiento (delta fotos-y-seguridad)
- [ ] Usuarios por profesional + 2FA, cifrado, auditoría, backups (delta fotos-y-seguridad)
- [ ] Mejora visual del panel con references/diseños
- [ ] Confirmar con Inés y su asesor legal: conservación, consentimiento, registro de la base

## 22/10 — fotos y seguridad (sin 2FA)
- [x] Usuarios por profesional, sesión firmada, bloqueo por intentos (SEG-003, SEG-007)
- [x] Cifrado del contenido clínico (SEG-004), registro de accesos (SEG-005), fotos con consentimiento (FOT-001..003)
- [x] Backup y restauración de prueba local (SEG-006); falta el cron a B2 en producción
- [x] Mejora visual del panel: navegación activa, tarjetas, tablas, foco y transiciones sobrias (referencias: motion-primitives, tablecn, kibo-ui)
- [ ] Legal con Inés: conservación, consentimiento, registro de la base
- [ ] Confirmar con Inés que "romano" = "cuadrado/polinesio"
