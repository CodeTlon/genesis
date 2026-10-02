import { revalidatePath } from 'next/cache'

// El panel llama acá después de guardar para que el sitio se actualice al instante (si no, se actualiza solo en ≤ 60 s).
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? 'dev-secret'
  if (req.headers.get('x-revalidate-secret') !== secret) return new Response('No autorizado', { status: 401 })
  revalidatePath('/', 'layout')
  return Response.json({ ok: true })
}
