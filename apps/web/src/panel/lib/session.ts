'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { and, eq, gt, sql } from 'drizzle-orm'
import { db, schema } from '@genesis/db/client'
import { getAuth } from '@/lib/auth'
import { audit, clientIp } from './auth-server'

// Por correo el umbral es bajo; por IP es alto para no dejar afuera a todo un consultorio que comparte conexión.
const MAX_FALLOS_CORREO = 5
const MAX_FALLOS_IP = 30
const VENTANA_MIN = 15

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const ip = await clientIp()

  // Límite de intentos por correo e IP (persistente: sobrevive reinicios y varias instancias).
  const desde = new Date(Date.now() - VENTANA_MIN * 60_000)
  const fallos = (cond: ReturnType<typeof sql>) =>
    db().select({ n: sql<number>`count(*)::int` }).from(schema.auditLog)
      .where(and(eq(schema.auditLog.action, 'login_failed'), gt(schema.auditLog.at, desde), cond)).then((r) => r[0].n)
  const [porCorreo, porIp] = await Promise.all([
    fallos(sql`${schema.auditLog.entityId} = ${email}`),
    ip ? fallos(sql`${schema.auditLog.ip} = ${ip}`) : Promise.resolve(0),
  ])
  if (porCorreo >= MAX_FALLOS_CORREO || porIp >= MAX_FALLOS_IP) redirect('/panel/login?error=bloqueado')

  try {
    const res = await getAuth().api.signInEmail({ body: { email, password }, headers: await headers() })
    await audit(res.user.id, 'login')
  } catch {
    await audit(null, 'login_failed', 'email', email)
    redirect('/panel/login?error=1')
  }
  redirect('/panel/inicio')
}

export async function signOut() {
  await getAuth().api.signOut({ headers: await headers() })
  redirect('/panel/login')
}
