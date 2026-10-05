import { cookies } from 'next/headers'
import { exportLog, importLog } from './store'

/**
 * Estado de cada visitante. Vercel reparte los pedidos entre instancias distintas, así que la memoria del servidor no sirve para
 * recordar lo que hizo la persona. En su lugar, los cambios (confirmar un turno, moverlo, firmar...) viajan en cookies y se
 * reaplican sobre los datos de práctica en cada pedido. Funciona igual en local y en producción, sin servicios externos.
 */
const NAME = 'gl'
const CHUNK = 3300 // una cookie admite ~4 KB: el registro se parte en trozos
const MAX_CHUNKS = 4
const OPTS = { httpOnly: true, sameSite: 'lax' as const, path: '/panel', maxAge: 60 * 60 * 8, secure: !!process.env.VERCEL }

type Jar = Awaited<ReturnType<typeof cookies>>
const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
const dec = (s: string) => JSON.parse(Buffer.from(s, 'base64url').toString())

export function loadFrom(jar: Jar) {
  let raw = ''
  for (let i = 0; i < MAX_CHUNKS; i++) { const c = jar.get(`${NAME}${i}`)?.value; if (!c) break; raw += c }
  try { importLog(raw ? dec(raw) : null) } catch { importLog(null) }
}

export function saveTo(jar: Jar) {
  let saved = exportLog()
  let raw = enc(saved)
  // Si la sesión acumuló demasiados cambios, se descartan los más viejos antes que perder los nuevos.
  while (raw.length > CHUNK * MAX_CHUNKS && saved.ops.length) { saved = { ...saved, ops: saved.ops.slice(1) }; raw = enc(saved) }
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const part = raw.slice(i * CHUNK, (i + 1) * CHUNK)
    if (part) jar.set(`${NAME}${i}`, part, OPTS)
    else if (jar.has(`${NAME}${i}`)) jar.delete({ name: `${NAME}${i}`, path: OPTS.path })
  }
}

export function clearFrom(jar: Jar) {
  for (let i = 0; i < MAX_CHUNKS; i++) if (jar.has(`${NAME}${i}`)) jar.delete({ name: `${NAME}${i}`, path: OPTS.path })
}

/** Para páginas (solo lectura): llamar como ÚLTIMO await, así lo que sigue lee el estado de esta persona de forma síncrona. */
export async function hydrate() { loadFrom(await cookies()) }

/** Para acciones: carga el estado, aplica el cambio (síncrono) y lo guarda. */
export async function withState<T>(fn: () => T): Promise<T> {
  const jar = await cookies()
  loadFrom(jar)
  const r = fn()
  saveTo(jar)
  return r
}
