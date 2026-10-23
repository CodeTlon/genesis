import { Wordmark } from '@genesis/ui/wordmark'
import { signIn } from '@/panel/lib/session'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const msg = error === 'bloqueado'
    ? 'Demasiados intentos. Esperá unos minutos y probá de nuevo.'
    : error ? 'El correo o la contraseña no son correctos.' : null
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-center"><Wordmark size="lg" /><span className="sr-only"> Panel de gestión</span></h1>
      <p className="mt-2 text-center">Ingresá con tu usuario para ver las historias clínicas.</p>
      <form action={signIn} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="font-semibold">Correo</label>
          <input id="email" name="email" type="email" autoComplete="username" placeholder="Ej: nombre@correo.com" required aria-invalid={!!msg} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4 placeholder:text-tinta-suave" />
        </div>
        <div>
          <label htmlFor="password" className="font-semibold">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" required aria-invalid={!!msg} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4 placeholder:text-tinta-suave" />
          {msg && <p role="alert" className="mt-2 text-red-800">{msg}</p>}
        </div>
        <button className="min-h-touch w-full rounded-control bg-violeta-oscuro px-4 py-3 font-semibold text-white transition-colors hover:bg-tinta">Entrar</button>
      </form>
    </main>
  )
}
