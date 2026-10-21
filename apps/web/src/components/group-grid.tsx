import type { Group } from '@genesis/db/content'
import { Reveal } from '@genesis/ui/reveal'
import { GrupoCard } from './grupo-card'

/**
 * Grilla de grupos que nunca deja huecos: la última fila queda centrada.
 * Escritorio usa 6 columnas (cada tarjeta ocupa 2): con 5 grupos son 3 arriba y 2 centradas abajo.
 * Tablet usa 2 columnas: si sobra una, se centra.
 */
export function GroupGrid({ groups }: { groups: Group[] }) {
  const n = groups.length
  const restLg = n % 3 // tarjetas en la última fila de escritorio
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
      {groups.map((g, i) => {
        const last = i === n - 1
        const lgStart = restLg === 2 && i === n - 2 ? 'lg:col-start-2' : restLg === 1 && last ? 'lg:col-start-3' : ''
        const smAlone = n % 2 === 1 && last ? 'sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)] lg:col-span-2 lg:mx-0 lg:w-auto' : ''
        return (
          <Reveal key={g.slug} delay={(i % 3) * 90} className={`h-full lg:col-span-2 ${lgStart} ${smAlone}`}>
            <GrupoCard g={g} />
          </Reveal>
        )
      })}
    </div>
  )
}
