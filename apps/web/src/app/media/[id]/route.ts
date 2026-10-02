import { getMedia } from '@genesis/db/content'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await getMedia((await params).id).catch(() => undefined)
  if (!m) return new Response('No encontrado', { status: 404 })
  return new Response(new Uint8Array(m.bytes), { headers: { 'Content-Type': m.mime, 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
