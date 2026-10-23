import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { query, TENANT_ID } from '@genesis/db/client'
import { hashPassword, verifyPassword } from './auth-core'
import { verifySession } from './session'

export type SessionUser = { id: string; username: string; name: string }

// Modo demo (GENESIS_DEMO_USERS=1): usuarios ficticios con la clave DEMO_PASSWORD. En producción los usuarios se crean con `npm run user:add`.
const DEMO_USERS = [{ id: 'u-ines', username: 'ines', name: 'Inés (Podología)' }, { id: 'u-valentina', username: 'valentina', name: 'Valentina (Estética)' }]
let demoReady: Promise<void> | undefined
async function ensureDemoUsers() {
  if (process.env.GENESIS_DEMO_USERS !== '1') return
  return (demoReady ??= (async () => {
    const hash = hashPassword(process.env.DEMO_PASSWORD ?? 'genesis-demo')
    for (const u of DEMO_USERS) {
      await query(
        `INSERT INTO hc_users (id, tenant_id, username, display_name, password_hash) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, display_name = EXCLUDED.display_name`,
        [u.id, TENANT_ID, u.username, u.name, hash])
    }
  })().catch((e) => { demoReady = undefined; throw e }))
}

// Bloqueo por intentos fallidos (REQ-SEG-007). En memoria por proceso; se indexa por el usuario escrito, exista o no.
const g = globalThis as unknown as { __genesisFails?: Map<string, { n: number; until: number }> }
const fails = (g.__genesisFails ??= new Map<string, { n: number; until: number }>())
export const isLocked = (u: string) => (fails.get(u)?.until ?? 0) > Date.now()
const noteFail = (u: string) => {
  const f = fails.get(u) ?? { n: 0, until: 0 }
  f.n += 1
  if (f.n >= 5) { f.until = Date.now() + 5 * 60_000; f.n = 0 }
  fails.set(u, f)
}

const DUMMY = hashPassword('no-existe')

/** Valida usuario y contraseña. Con usuario inexistente igual calcula el hash, para no revelar cuáles existen. */
export async function checkLogin(usernameRaw: string, password: string): Promise<SessionUser | 'locked' | null> {
  const username = usernameRaw.trim().toLowerCase()
  if (isLocked(username)) return 'locked'
  await ensureDemoUsers()
  const [r] = await query<{ id: string; username: string; display_name: string; password_hash: string }>('SELECT * FROM hc_users WHERE tenant_id=$1 AND username=$2', [TENANT_ID, username])
  const ok = verifyPassword(password, r?.password_hash ?? DUMMY)
  if (!r || !ok) { noteFail(username); return null }
  fails.delete(username)
  return { id: r.id, username: r.username, name: r.display_name }
}

export async function currentUser(): Promise<SessionUser | null> {
  const id = await verifySession((await cookies()).get('gs')?.value)
  if (!id) return null
  const [r] = await query<{ id: string; username: string; display_name: string }>('SELECT id, username, display_name FROM hc_users WHERE id=$1', [id])
  return r ? { id: r.id, username: r.username, name: r.display_name } : null
}

export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser()
  if (!u) redirect('/login')
  return u
}

/** REQ-SEG-005: registro de accesos (append-only en la base). Falla cerrado: si no se puede registrar, la acción no sigue. */
export async function audit(action: string, o: { patientId?: string; entryId?: string; detail?: string; user?: SessionUser | null } = {}) {
  const u = o.user === undefined ? await currentUser() : o.user
  await query(
    `INSERT INTO hc_audit (tenant_id, user_id, user_name, action, patient_id, entry_id, detail) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [TENANT_ID, u?.id ?? null, u?.name ?? 'Sin sesión', action, o.patientId ?? null, o.entryId ?? null, o.detail ?? null])
}
