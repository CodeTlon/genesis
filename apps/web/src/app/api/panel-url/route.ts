export const dynamic = 'force-dynamic'

/**
 * URL del panel de la demo, resuelta al momento de la visita (no al compilar), así que alcanza con definir PANEL_URL en el hosting.
 * - PANEL_URL definida: se usa tal cual (panel en otro dominio).
 * - En Vercel (un solo proyecto con servicios): el panel está en /panel del mismo dominio.
 * - En local: se asume el panel en el puerto 3001.
 */
export function GET(req: Request) {
  const host = new URL(req.url).hostname
  const local = host === 'localhost' || host === '127.0.0.1'
  const origin = new URL(req.url).origin
  const url = process.env.PANEL_URL || (process.env.VERCEL ? `${origin}/panel` : local ? `http://${host}:3001` : '')
  return Response.json({ url }, { headers: { 'Cache-Control': 'no-store' } })
}
