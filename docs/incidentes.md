# Qué hacer ante un incidente — Genesis

> Borrador para Fase 1 (datos reales). En la demo no hay datos reales. Validar con un profesional del derecho.

## Se perdió o robaron un dispositivo (compu o celular)
1. Cambiar la contraseña de todos los usuarios que lo usaban y cerrar sus sesiones.
2. Si tenía 2FA, revocar el dispositivo registrado y generar un código nuevo.
3. Anotar fecha, hora y qué dispositivo era.
4. Revisar el registro de auditoría de las últimas 48 h en busca de accesos raros.

## Sospecha de acceso indebido
1. Bloquear al usuario sospechado y rotar la clave de acceso.
2. Exportar el registro de auditoría (quién vio qué paciente y cuándo) antes de tocar nada.
3. Evaluar qué pacientes pudieron verse afectados.
4. Avisar a los pacientes alcanzados y consultar con el abogado por obligaciones ante la AAIP ⚖️.

## Se perdieron datos
1. No escribir sobre el sistema.
2. Restaurar el último backup cifrado (objetivos: pérdida máxima 24 h, recuperación en 4 h).
3. Verificar la integridad de la historia clínica (el hash encadenado de cada entrada detecta alteraciones).

## Después de cualquier incidente
Registrar qué pasó, cómo se resolvió y qué se cambia para que no se repita.
