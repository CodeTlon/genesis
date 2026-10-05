import { Wordmark } from '@genesis/ui/wordmark'
import { enterDemo } from '@/lib/session'
import { PROFILES } from '@/lib/profiles'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; tour?: string }> }) {
  const { error, tour } = await searchParams
  const needsPassword = !!process.env.DEMO_PASSWORD
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-center"><Wordmark size="xl" className="items-center" /><span className="sr-only"> Panel de gestión</span></h1>
      <p className="mt-2 text-center">Demo interactiva con datos 100 % ficticios. Elegí con qué perfil querés entrar.</p>
      <form action={enterDemo} className="mt-8 space-y-4">
        {tour === '1' && <input type="hidden" name="tour" value="1" />}
        {needsPassword && (
          <div>
            <label htmlFor="password" className="font-semibold">Contraseña de la demo</label>
            <input id="password" name="password" placeholder="Escribí la contraseña de la demo" type="password" autoComplete="current-password" required aria-invalid={!!error} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4" />
            {error && <p role="alert" className="mt-2 text-red-800">La contraseña no es correcta. Probá de nuevo.</p>}
          </div>
        )}
        {Object.entries(PROFILES).map(([id, p], i) => (
          <button key={id} name="profile" value={id} className={`min-h-touch w-full rounded-control px-4 py-3 text-left transition-colors ${i === 0 ? 'bg-violeta-oscuro text-white hover:bg-tinta' : 'border border-tinta/60 bg-white hover:bg-lila/40'}`}>
            <span className="block font-semibold">{p.loginLabel}</span>
            <span className="block text-sm opacity-90">Datos de práctica, sin pacientes reales</span>
          </button>
        ))}
      </form>
      <p className="mt-6 text-center text-sm text-tinta/80">Podés practicar sin miedo: nada de lo que hagas es real y se puede reiniciar cuando quieras.</p>
    </main>
  )
}
