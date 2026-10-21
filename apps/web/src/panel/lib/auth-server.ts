// Helpers de servidor (NO es un archivo 'use server': nada de esto se expone como acción pública).
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db, schema } from '@genesis/db/client'
import { getAuth } from '@/lib/auth'

export type SessionUser = { id: string; name: string; email: string; role: 'admin' | 'profesional'; licenseNo: string | null }

/** Usuario de la sesión actual, validado contra la base (no solo la cookie). */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const s = await getAuth().api.getSession({ headers: await headers() })
  if (!s) return null
  const u = s.user as typeof s.user & { role?: string; licenseNo?: string | null }
  return { id: u.id, name: u.name, email: u.email, role: u.role === 'admin' ? 'admin' : 'profesional', licenseNo: u.licenseNo ?? null }
})

/** Toda página y acción del panel arranca por acá: sin sesión válida no se lee ni se escribe nada. */
export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser()
  if (!u) redirect('/panel/login')
  return u
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser()
  if (u.role !== 'admin') throw new Error('Requiere rol administrador')
  return u
}

export async function clientIp(): Promise<string | null> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null
}

/** Registro de auditoría (solo se agrega; la base impide editarlo). Nunca debe tirar abajo la operación principal. */
export async function audit(userId: string | null, action: string, entity?: string, entityId?: string) {
  try {
    await db().insert(schema.auditLog).values({ userId, action, entity, entityId, ip: await clientIp() })
  } catch (e) {
    console.error('audit: no se pudo registrar', action, e)
  }
}
