import Image from 'next/image'
import Link from 'next/link'
import type { Group } from '@genesis/db/content'
import { SpotlightCard } from './spotlight-card'

export function GrupoCard({ g }: { g: Group }) {
  const cantidad = g.services.length
  return (
    <SpotlightCard>
      <Link href={`/servicios/${g.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-lila to-malva">
          {g.image && <Image src={g.image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
        </div>
        <div className="p-6">
          <h3 className="text-xl transition-colors group-hover:text-violeta-oscuro font-normal uppercase tracking-[0.06em]">{g.name}</h3>
          <p className="mt-2">{g.tagline}</p>
          <p className="font-label mt-4 text-sm uppercase tracking-widest text-violeta-oscuro">
            {cantidad} {cantidad === 1 ? 'servicio' : 'servicios'} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </p>
        </div>
      </Link>
    </SpotlightCard>
  )
}
