# Propuesta: ficha-clinica

## Por qué
Inés (dueña, podóloga) pidió reemplazar la agenda en papel por su sistema de historias clínicas. Decisión del 18/10: por ahora **solo historias clínicas** (opción 1); web y turnos quedan para más adelante porque primero ordena la sala de espera y la parte legal. No tiene secretaria; cada profesional atiende turnos por su propio WhatsApp.

## Alcance
- Capacidades afectadas: PAC, HC, MAP.
- Dentro: datos básicos completos (ocupación y contacto de emergencia), conclusión y sugerencias, antecedentes que levantan alertas, mapa de pies con forma de pie (romano, griego, egipcio) y pasar pacientes y atenciones de memoria a Postgres.

## Fuera de alcance
- Agenda unificada, turnos online, WhatsApp simulado y sitio público/CMS: no se tocan ni se quitan; no se desarrollan hasta nueva decisión.
- Fotos y seguridad Fase 1: delta `20261022-fotos-y-seguridad`.

## Preguntas abiertas
- La ficha de cuando Inés estudió: ella iba a mandar una foto con los campos de referencia. **Falta.** Hasta que llegue, la lista de campos es de Mateo, no textual de ella.
- Qué significa exactamente cada forma de pie para Inés (romano, griego, egipcio): se asume una por pie.

## Supuestos
- La forma de pie se elige **por pie** (puede diferir izquierdo y derecho) y se guarda en la atención.
- Ocupación y contacto de emergencia son opcionales; el resto de los datos básicos ya existe.
