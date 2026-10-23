---
capacidad: FOT
perfil: S2
rutas: apps/web/src/panel/lib/photos.ts, apps/web/src/panel/components/photos.tsx, apps/web/src/app/api/clinico/fotos, apps/web/src/app/panel-media
---
# Fotos clínicas

Fotos de la primera consulta, la evolución y el final. Son dato de salud: validadas y solo con sesión.

## Requisitos

### REQ-FOT-001 [must] Subir fotos al caso
El sistema DEBE permitir subir una foto al caso de un paciente desde la sesión de una profesional y mostrarla en el caso.
- Escenario: Dado un caso abierto, Cuando se sube una foto inicial válida, Entonces la foto se guarda y aparece en el caso.
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
