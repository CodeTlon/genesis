import { query } from '@genesis/db/client'

export const dynamic = 'force-dynamic'
const STARTED_AT = new Date().toISOString()

// Público a propósito (lo consulta el healthcheck del orquestador): solo informa estado, nunca datos.
export async function GET() {
  try {
    await query('select 1')
    return Response.json({ status: 'ok', db: 'ok', started_at: STARTED_AT }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ status: 'error', db: 'down', started_at: STARTED_AT }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
