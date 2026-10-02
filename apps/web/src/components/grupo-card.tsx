import Image from 'next/image'
import Link from 'next/link'
import { SpotlightCard } from './spotlight-card'
import type { Grupo } from '@/lib/site'

export function GrupoCard({ g, cantidad }: { g: Grupo; cantidad: number }) {
  return (
    <SpotlightCard>
      <Link href={`/servicios/${g.slug}`} className="group block">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-lila to-malva">
          {g.imagen && <Image src={`/img/${g.imagen}.webp`} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-light uppercase tracking-[0.12em]">{g.nombre}</h3>
          <p className="mt-2">{g.lema}</p>
          <p className="font-label mt-4 text-sm uppercase tracking-widest text-violeta-oscuro">
            {cantidad} {cantidad === 1 ? 'servicio' : 'servicios'} →
          </p>
        </div>
      </Link>
    </SpotlightCard>
  )
}
