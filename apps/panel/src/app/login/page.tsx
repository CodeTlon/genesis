import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { audit, checkLogin } from '@/lib/auth'
import { signSession } from '@/lib/session'

async function login(formData: FormData) {
  'use server'
  const username = String(formData.get('username') ?? '')
  const u = await checkLogin(username, String(formData.get('password') ?? ''))
  if (u === 'locked') redirect('/login?error=2')
  if (!u) redirect('/login?error=1')
  ;(await cookies()).set('gs', await signSession(u.id, 60 * 60 * 8), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 })
  await audit('ingreso', { user: u })
  redirect('/hoy')
}

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const field = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/40 bg-white px-4'
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Image src="/logo.webp" alt="Genesis Estética Integral" width={96} height={96} className="mx-auto rounded-full" priority />
      <h1 className="mt-6 text-center text-2xl font-light uppercase tracking-[0.15em]">Panel Genesis</h1>
      <p className="mt-2 text-center">Ingresá con tu usuario de profesional.</p>
      <form action={login} className="mt-8 space-y-4">
        <div><label htmlFor="username" className="font-semibold">Usuario</label>
          <input id="username" name="username" autoComplete="username" required autoCapitalize="none" className={field} /></div>
        <div><label htmlFor="password" className="font-semibold">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={!!error} className={field} /></div>
        {error === '1' && <p role="alert" className="text-red-800">El usuario o la contraseña no son correctos. Probá de nuevo.</p>}
        {error === '2' && <p role="alert" className="text-red-800">Demasiados intentos. Esperá 5 minutos y probá de nuevo.</p>}
        <button className="min-h-touch w-full rounded-control bg-violeta-oscuro text-white">Entrar</button>
      </form>
    </main>
  )
}
