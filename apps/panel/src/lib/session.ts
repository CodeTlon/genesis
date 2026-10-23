// Cookie de sesión firmada con HMAC-SHA256 (Web Crypto: la usan el middleware y el servidor).
// Formato: <tipo>.<usuario>.<vence>.<firma>.

const enc = new TextEncoder()

async function mac(data: string): Promise<string> {
  const secret = process.env.GENESIS_SESSION_SECRET
  if (!secret || secret.length < 16) throw new Error('Falta GENESIS_SESSION_SECRET (mínimo 16 caracteres).')
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)))).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function signSession(userId: string, ttlSeconds: number): Promise<string> {
  const body = `s.${userId}.${Math.floor(Date.now() / 1000) + ttlSeconds}`
  return `${body}.${await mac(body)}`
}

/** Devuelve el id de usuario si la firma es válida, no venció y es del tipo pedido. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== 's' || Number(parts[2]) < Date.now() / 1000) return null
  let good: string
  try { good = await mac(parts.slice(0, 3).join('.')) } catch { return null }
  if (good.length !== parts[3].length) return null
  let diff = 0
  for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ parts[3].charCodeAt(i)
  return diff === 0 ? parts[1] : null
}
