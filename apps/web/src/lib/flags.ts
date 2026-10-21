// Feature flags por variable de entorno, leídas en servidor. Por defecto (producto de Inés) el sitio público y el CMS están apagados.
// Apagado = la ruta responde 404 / redirige: no alcanza con ocultar el enlace.
const on = (name: string) => process.env[name] === 'true'

export const flags = {
  site: () => on('FEATURE_SITE'),
  cms: () => on('FEATURE_CMS'),
}
