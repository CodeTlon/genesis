import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'

async function login(formData: FormData) {
  'use server'
  const pw = process.env.DEMO_PASSWORD ?? 'genesis-demo'
  if (formData.get('password') !== pw) redirect('/login?error=1')
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`genesis:${pw}`))
  const token = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  ;(await cookies()).set('gp', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 })
  redirect('/hoy')
}

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Image src="/logo.webp" alt="Genesis Estética Integral" width={96} height={96} className="mx-auto rounded-full" priority />
      <h1 className="mt-6 text-center text-2xl font-light uppercase tracking-[0.15em]">Panel Genesis</h1>
      <p className="mt-2 text-center">Versión de demostración con datos ficticios.</p>
      <form action={login} className="mt-8 space-y-4">
        <label htmlFor="password" className="font-semibold">Contraseña de la demo</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={!!error} className="block min-h-touch w-full rounded-control border border-tinta/40 bg-white px-4" />
        {error && <p role="alert" className="text-red-800">La contraseña no es correcta. Probá de nuevo.</p>}
        <button className="min-h-touch w-full rounded-control bg-violeta-oscuro text-white">Entrar</button>
      </form>
    </main>
  )
}
