import Link from 'next/link'
import { IconArrowLeft } from './icons'

/** Ruta de migas + botón "Volver" grande. `trail` son los niveles superiores (el último es a donde vuelve el botón). */
export function BackBar({ trail }: { trail: { href: string; label: string }[] }) {
  const back = trail[trail.length - 1]
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 print:hidden">
      <Link href={back.href} className="inline-flex min-h-touch items-center gap-2 rounded-control border border-tinta/40 bg-white px-4 font-semibold hover:bg-lila/40">
        <IconArrowLeft /> Volver
      </Link>
      <nav aria-label="Ruta" className="min-w-0 text-base text-tinta-suave max-md:hidden">
        <ol className="flex flex-wrap items-center gap-2">
          {trail.map((t, i) => (
            <li key={t.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              <Link href={t.href} className="underline-offset-2 hover:underline">{t.label}</Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
