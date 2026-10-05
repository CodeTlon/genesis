export const dynamic = 'force-dynamic'

/**
 * URL del panel de la demo, resuelta al momento de la visita (no al compilar), así que alcanza con definir PANEL_URL en el hosting.
 * En local, si no está definida, se asume el panel en el puerto 3001.
 */
export function GET(req: Request) {
  const host = new URL(req.url).hostname
  const local = host === 'localhost' || host === '127.0.0.1'
  const url = process.env.PANEL_URL || (local ? `http://${host}:3001` : '')
  return Response.json({ url }, { headers: { 'Cache-Control': 'no-store' } })
}
