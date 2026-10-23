---
capacidad: FOT
perfil: S2
rutas: apps/web/src/panel/lib/photos.ts, apps/web/src/panel/components/photos.tsx, apps/web/src/app/api/clinico/fotos, apps/web/src/app/panel-media
---
# Fotos clínicas

Fotos de la primera consulta, la evolución y el final. Son dato de salud: con consentimiento, validadas y solo con sesión.

## Requisitos

### REQ-FOT-001 [must] Consentimiento antes de fotografiar
El sistema NO DEBE permitir subir fotos de un paciente sin un consentimiento de fotos vigente; la base también lo exige (`consent_id` obligatorio).
- Escenario: Dado un caso de un paciente sin consentimiento de fotos, Cuando se intenta subir una foto, Entonces se avisa que primero hay que registrarlo; con consentimiento la foto inicial se guarda.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-FOT-002 [must] Solo imágenes válidas, sin metadatos
El sistema DEBE rechazar archivos que no sean imágenes reales (por contenido, no por extensión), SVG y archivos mayores al límite, y re-codificar las fotos a WebP sin metadatos EXIF.
- Escenario: Dado un archivo de texto que dice ser JPG, Cuando se sube, Entonces responde 422.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-FOT-003 [must] Fotos solo con sesión y sin caché
El sistema NO DEBE servir una foto a quien no tiene sesión; con sesión DEBE servirla con `Cache-Control: no-store` y registrar el acceso en la auditoría.
- Escenario: Dado la URL de una foto, Cuando se pide sin sesión, Entonces responde 401.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado
