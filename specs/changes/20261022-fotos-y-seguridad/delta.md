# Delta: fotos-y-seguridad

## ADDED

### REQ-FOT-001 [must] Fotos de la primera consulta y de la evolución
El sistema DEBE permitir adjuntar fotos a una atención, marcadas como "primera consulta" o "evolución", y verlas ordenadas por fecha en la historia.
- Escenario: Dado una atención, Cuando se suben una foto inicial y otra de evolución, Entonces la historia las lista por fecha con su etiqueta.
- verify: e2e e2e/fotos.spec.ts

### REQ-FOT-002 [must] Consentimiento antes de fotografiar
El sistema NO DEBE permitir subir fotos de un paciente sin el consentimiento de imagen clínica vigente.
- Escenario: Dado un paciente con consentimiento pendiente, Cuando se intenta subir una foto, Entonces se rechaza con un aviso.
- verify: e2e e2e/fotos.spec.ts

### REQ-FOT-003 [must] Fotos solo con sesión
El sistema NO DEBE servir una foto a quien no tiene sesión; las fotos NO DEBEN estar en una carpeta pública.
- Escenario: Dado la URL de una foto, Cuando se pide sin sesión, Entonces redirige a `/login`.
- verify: e2e e2e/fotos.spec.ts

### REQ-SEG-003 [must] Usuario por profesional con segundo factor
El sistema DEBE reemplazar la clave única de demo por un usuario y contraseña por profesional con segundo factor.
- Escenario: Dado un profesional con 2FA activo, Cuando entra con la contraseña correcta, Entonces se le pide el segundo factor.
- verify: e2e e2e/seguridad.spec.ts

### REQ-SEG-004 [must] Contenido clínico cifrado
El sistema DEBE guardar el contenido clínico (atenciones, adendas, notas) cifrado en la base.
- Escenario: Dado una atención guardada, Cuando se lee la fila directo en la base, Entonces el contenido no es legible.
- verify: contract tests/cifrado.test.ts

### REQ-SEG-005 [must] Registro de accesos
El sistema DEBE registrar quién abrió, creó o corrigió cada historia, con fecha y hora, y ese registro NO DEBE poder borrarse desde el panel.
- Escenario: Dado un profesional que abre una ficha, Cuando se consulta el registro, Entonces figura su usuario y la hora.
- verify: contract tests/auditoria.test.ts

### REQ-SEG-006 [must] Backups verificados
El sistema DEBE tener backup diario de la base y de las fotos, con una restauración de prueba fechada.
- Escenario: Dado el backup del día, Cuando se restaura en una base vacía, Entonces las historias coinciden con las originales.
- verify: manual MANUAL-PRUEBAS.md#REQ-SEG-006
