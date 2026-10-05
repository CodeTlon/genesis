'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { resetDemo } from './store'
import { PROFILES, type ProfileId } from './profiles'

export async function sessionToken() {
  const pw = process.env.DEMO_PASSWORD
  if (!pw) return 'open'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`genesis:${pw}`))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function currentAuthor() {
  const id = (await cookies()).get('gu')?.value as ProfileId | undefined
  return (id && PROFILES[id]?.name) || PROFILES.pr1.name
}

/** Entrar sin contraseña (salvo que DEMO_PASSWORD esté definida) eligiendo un perfil ficticio. */
export async function enterDemo(formData: FormData) {
  const pw = process.env.DEMO_PASSWORD
  if (pw && formData.get('password') !== pw) redirect('/login?error=1')
  const profile = String(formData.get('profile'))
  const jar = await cookies()
  const opts = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 8 }
  jar.set('gp', await sessionToken(), opts)
  jar.set('gu', profile in PROFILES ? profile : 'pr1', opts)
  redirect('/hoy')
}

export async function leaveDemo() {
  const jar = await cookies()
  jar.delete('gp'); jar.delete('gu')
  redirect('/login')
}

export async function restartDemo() {
  resetDemo()
  revalidatePath('/', 'layout')
  redirect('/hoy')
}
