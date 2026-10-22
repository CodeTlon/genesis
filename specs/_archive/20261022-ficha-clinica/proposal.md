# Propuesta: ficha-clinica

## Por qué
Inés (dueña, podóloga) pidió reemplazar la agenda en papel por su sistema de historias clínicas. Decisión del 18/10: por ahora **solo historias clínicas** (opción 1); web y turnos quedan para más adelante porque primero ordena la sala de espera y la parte legal. No tiene secretaria; cada profesional atiende turnos por su propio WhatsApp.

## Alcance
- Capacidades afectadas: PAC, HC, MAP.
- Dentro: datos básicos completos (los datos y bloques de la ficha de Inés (antecedentes, calzado, examen por pie, patologías por dedo, tratamiento y control)), conclusión y sugerencias, antecedentes que levantan alertas, mapa de pies con forma de pie (romano, griego, egipcio) y pasar pacientes y atenciones de memoria a Postgres.

## Fuera de alcance
- Agenda unificada, turnos online, WhatsApp simulado y sitio público/CMS: no se tocan ni se quitan; no se desarrollan hasta nueva decisión.
- Fotos y seguridad Fase 1: delta `20261022-fotos-y-seguridad`.

## Preguntas abiertas
- Inés usa la ficha «Historia clínica podológica» del Instituto García Lorca (fotos recibidas el 20/10). **Se toma como base.** La lista de datos básicos que armó Mateo se ajusta a ella; «contacto de emergencia» no está en la ficha y queda opcional.
- «Romano» (lo que dijo Inés) = «cuadrado / polinesio» de la ficha: se muestra como «Romano (cuadrado)». Confirmar con ella.

## Supuestos
- La forma de pie se elige **por pie** (puede diferir izquierdo y derecho) y se guarda en la atención.
- Las fotos de la ficha traen datos de una paciente real: no se copian al repo; solo se usa su estructura. La ficha inicial se modela como una plantilla más (F), junto a A, B y C.
