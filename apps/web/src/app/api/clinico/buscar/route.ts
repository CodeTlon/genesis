import { z } from 'zod'
import { currentUser } from '@/panel/lib/auth-server'
import { listPatients } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const Query = z.object({ q: z.string().trim().min(2).max(80) })
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** Búsqueda rápida de pacientes para la paleta de comandos. Solo devuelve datos de identificación (nunca textos clínicos) y exige sesión. */
export async function GET(req: Request) {
  const user = await currentUser()
  if (!user) return json({ ok: false, message: 'Tu sesión venció. Volvé a ingresar.' }, 401)
  const parsed = Query.safeParse({ q: new URL(req.url).searchParams.get('q') ?? '' })
  if (!parsed.success) return json({ ok: true, results: [] })
  const rows = await listPatients(parsed.data.q, 8)
  return json({ ok: true, results: rows.map((p) => ({ id: p.id, name: `${p.lastName}, ${p.firstName}`, meta: [p.dni && `DNI ${p.dni}`, p.phone].filter(Boolean).join(' · '), alerts: p.alerts })) })
}
