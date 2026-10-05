import Image from 'next/image'
import { enterDemo } from '@/lib/session'
import { PROFILES } from '@/lib/profiles'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const needsPassword = !!process.env.DEMO_PASSWORD
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Image src="/logo.webp" alt="Genesis" width={96} height={96} className="mx-auto" priority />
      <h1 className="mt-6 text-center text-2xl uppercase tracking-[0.06em]">Panel Genesis</h1>
      <p className="mt-2 text-center">Demo interactiva con datos 100 % ficticios. Elegí con qué perfil querés entrar.</p>
      <form action={enterDemo} className="mt-8 space-y-4">
        {needsPassword && (
          <div>
            <label htmlFor="password" className="font-semibold">Contraseña de la demo</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={!!error} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4" />
            {error && <p role="alert" className="mt-2 text-red-800">La contraseña no es correcta. Probá de nuevo.</p>}
          </div>
        )}
        {Object.entries(PROFILES).map(([id, p], i) => (
          <button key={id} name="profile" value={id} className={`min-h-touch w-full rounded-control px-4 py-3 text-left transition-colors ${i === 0 ? 'bg-violeta-oscuro text-white hover:bg-tinta' : 'border border-tinta/60 bg-white hover:bg-lila/40'}`}>
            <span className="block font-semibold">Entrar como {p.name}</span>
            <span className="block text-sm opacity-90">{p.role} · datos de práctica</span>
          </button>
        ))}
      </form>
      <p className="mt-6 text-center text-sm text-tinta/80">Podés practicar sin miedo: nada de lo que hagas es real y se puede reiniciar cuando quieras.</p>
    </main>
  )
}
