import Link from 'next/link'
import { IconArrowLeft, IconChevronRight } from './icons'

/**
 * Ruta de migas que también hace de "volver": en el celular queda solo el nivel de arriba con una flecha ("‹ Pacientes");
 * en pantallas grandes se ve toda la ruta y el último nivel, que es a donde se vuelve, lleva la flecha. `trail` son los niveles superiores.
 */
export function BackBar({ trail }: { trail: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Ruta" className="print:hidden">
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((t, i) => {
          const last = i === trail.length - 1
          return (
            <li key={t.href} className={`items-center gap-1 ${last ? 'flex' : 'hidden md:flex'}`}>
              {i > 0 && <IconChevronRight className="size-4 text-tinta-suave" />}
              <Link href={t.href} aria-label={last ? `Volver a ${t.label}` : undefined}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 transition-colors hover:bg-lila/40 ${last ? 'font-semibold text-violeta-oscuro' : 'text-tinta-suave'}`}>
                {last && <IconArrowLeft className="size-5" />}{t.label}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
