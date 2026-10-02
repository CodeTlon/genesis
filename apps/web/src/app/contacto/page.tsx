import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Dirección, horarios y formas de contacto de Genesis Estética Integral en Córdoba.',
}

export default function Contacto() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Contacto</h1>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">Dirección</dt>
          <dd className="mt-1">{SITE.address}</dd>
          <dd><a href={SITE.mapsUrl} rel="noopener noreferrer" className="mt-2 inline-flex min-h-touch items-center underline">Cómo llegar (abre Google Maps)</a></dd>
        </div>
        <div>
          <dt className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">Horarios</dt>
          <dd className="mt-1 italic">A confirmar. Pedí tu turno y te indicamos los días y horarios disponibles.</dd>
        </div>
        <div>
          <dt className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">Instagram</dt>
          <dd className="mt-1"><a href={SITE.instagram} rel="noopener noreferrer" className="inline-flex min-h-touch items-center underline">{SITE.instagramHandle}</a></dd>
        </div>
      </dl>
      <Link href="/pedir-turno" className="mt-10 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white">Pedir turno</Link>
    </main>
  )
}
