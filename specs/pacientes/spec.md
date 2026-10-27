---
capacidad: PAC
perfil: S2
rutas: apps/web/src/panel/lib/repo.ts, apps/web/src/panel/lib/actions.ts, apps/web/src/panel/components/forms.tsx, apps/web/src/app/(panel)/panel/(app)/pacientes
---
# Pacientes: ficha base

La profesional da de alta y edita pacientes con los datos de la ficha en papel de Inés. Las alertas de precaución se derivan de los antecedentes (ver ANT).

## Requisitos

### REQ-PAC-001 [must] Alta y datos básicos
El sistema DEBE permitir crear un paciente con nombre y apellido obligatorios, y guardar DNI, fecha de nacimiento, teléfono, domicilio, ocupación, obra social y contacto de emergencia.
- Escenario: Dado el formulario de alta, Cuando se completa nombre y apellido y se crea, Entonces se abre la ficha del paciente.
- verify: e2e e2e/panel.spec.ts
- confianza: confirmado

### REQ-PAC-004 [must] Responsable obligatorio si es menor
El sistema DEBE exigir el nombre del responsable cuando el paciente es menor de 18 años.
- Escenario: Dado un paciente nacido hace 10 años, Cuando se guarda sin responsable, Entonces se rechaza con un aviso.
- verify: e2e e2e/ficha.spec.ts
- confianza: confirmado

### REQ-PAC-005 [must] Datos de la ficha de Inés
El sistema DEBE guardar de cada paciente fecha de primera consulta, nacionalidad, sexo, estatura, peso, grupo sanguíneo y otras actividades, además de la ocupación.
- Escenario: Dado un paciente nuevo, Cuando se cargan esos datos y se recarga la ficha, Entonces los campos conservan lo guardado.
- verify: e2e e2e/ficha.spec.ts
- confianza: confirmado

### REQ-PAC-006 [must] Ficha organizada en pestañas
El sistema DEBE mostrar la ficha del paciente en pestañas (Casos, Antecedentes, Datos), una por vez, y DEBE conservar la pestaña activa en el parámetro `tab` de la URL.
- Escenario: Dado un paciente, Cuando se abre `?tab=antecedentes`, Entonces se muestra solo el panel de Antecedentes.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-PAC-007 [must] Búsqueda en vivo de pacientes
El sistema DEBE filtrar la lista de pacientes mientras se escribe, sin pulsar un botón, y DEBERÍA seguir funcionando por envío de formulario sin JavaScript.
- Escenario: Dado que hay dos pacientes, Cuando se escribe parte de un apellido, Entonces solo queda visible el paciente que coincide.
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado

### REQ-PAC-008 [should] Pantalla de inicio con resumen
El sistema DEBE llevar tras el login a una pantalla de inicio con el saludo, un buscador de pacientes, los totales (pacientes, casos abiertos, evoluciones sin firmar y firmadas del mes) y la lista de evoluciones sin firmar para retomar.
- Escenario: Dado un paciente con una evolución sin firmar, Cuando se inicia sesión, Entonces se muestra el inicio y la evolución sin firmar aparece en "Para retomar".
- verify: e2e e2e/ux.spec.ts
- confianza: confirmado
