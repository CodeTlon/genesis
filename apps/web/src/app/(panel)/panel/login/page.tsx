import { Wordmark } from '@genesis/ui/wordmark'
import { FootShape } from '@/panel/components/foot-shape'
import { PasswordField } from '@/panel/components/password-field'
import { signIn } from '@/panel/lib/session'

const POINTS = [
  { t: 'Fichas ordenadas', d: 'Antecedentes, casos y evoluciones de cada paciente en un solo lugar.', p: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6' },
  { t: 'Mapa de pies', d: 'Marcá cada hallazgo sobre el pie, con su gravedad y su estado.', p: 'M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' },
  { t: 'Datos protegidos', d: 'Los textos clínicos se guardan cifrados y solo se ven con tu sesión.', p: 'M6 11V8a6 6 0 0112 0v3M5 11h14v10H5zM12 15v2' },
]

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const msg = error === 'bloqueado'
    ? 'Demasiados intentos. Esperá unos minutos y probá de nuevo.'
    : error ? 'El correo o la contraseña no son correctos.' : null
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="g-aurora relative flex flex-col justify-between overflow-hidden bg-[#efe8f7] px-6 py-8 text-tinta lg:px-14 lg:py-12">
        <span aria-hidden className="g-blob g-blob-1 !opacity-60" />
        <span aria-hidden className="g-blob g-blob-3 !opacity-50" />
        <FootShape className="g-float pointer-events-none absolute -right-28 bottom-[-9rem] hidden h-[32rem] -rotate-12 opacity-35 lg:block" />
        <div className="relative g-enter">
          <h1 className="text-center lg:text-left"><Wordmark size="lg" /><span className="sr-only"> Panel de gestión</span></h1>
          <p className="mt-3 text-center text-lg text-tinta-suave lg:text-left lg:text-xl">Historias clínicas de podología</p>
        </div>
        <ul className="g-stagger relative mt-10 hidden max-w-md space-y-5 lg:block">
          {POINTS.map((x) => (
            <li key={x.t} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-control bg-white text-violeta-oscuro shadow-soft">
                <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d={x.p} /></svg>
              </span>
              <span><span className="block text-lg font-semibold">{x.t}</span><span className="block text-tinta-suave">{x.d}</span></span>
            </li>
          ))}
        </ul>
        <p className="relative mt-10 hidden text-base text-tinta-suave lg:block">Genesis Estética Integral · Córdoba</p>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="g-enter w-full max-w-sm">
          <h2 className="text-3xl">Bienvenida</h2>
          <p className="mt-1 text-tinta-suave">Ingresá con tu usuario para ver las historias clínicas.</p>
          <form action={signIn} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="font-semibold">Correo</label>
              <input id="email" name="email" type="email" autoComplete="username" placeholder="Ej: nombre@correo.com" required aria-invalid={!!msg} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4 placeholder:text-tinta-suave" />
            </div>
            <div>
              <label htmlFor="password" className="font-semibold">Contraseña</label>
              <PasswordField invalid={!!msg} />
              {msg && <p role="alert" className="g-reveal mt-2 rounded-control bg-error-fondo px-3 py-2 text-error-texto">{msg}</p>}
            </div>
            <button className="min-h-touch w-full rounded-control bg-violeta-oscuro px-4 py-3 text-lg font-semibold text-white shadow-soft transition hover:bg-tinta hover:shadow-none">Entrar</button>
          </form>
          <p className="mt-8 text-center text-base text-tinta-suave">¿Problemas para entrar? Pedile ayuda a quien administra el sistema.</p>
        </div>
      </section>
    </main>
  )
}
