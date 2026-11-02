/**
 * Franja de aviso para el entorno de PRUEBA (variable APP_ENV=prueba): deja claro que los datos son ficticios y que no hay copia de seguridad.
 * En producción (sin esa variable) no se muestra nada.
 */
export function EnvBanner() {
  if (process.env.APP_ENV !== 'prueba') return null
  return (
    <p role="note" className="print:hidden bg-aviso-fondo px-4 py-2 text-center text-base font-semibold text-aviso-texto">
      Entorno de prueba: los datos son ficticios y pueden borrarse. No cargues pacientes reales.
    </p>
  )
}
