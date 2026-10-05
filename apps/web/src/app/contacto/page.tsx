import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent } from '@genesis/db/content'
import { IconCard, IconCheck } from '@/components/icons'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Dirección, horarios y formas de contacto de Genesis Estética Integral en Córdoba.',
}

export default async function Contacto() {
  const c = await getContent('contact')
  const label = 'font-label text-sm uppercase tracking-widest text-violeta-oscuro'
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Contacto</h1>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className={label}>Dirección</dt>
          <dd className="mt-1">{c.address}</dd>
          {c.mapsUrl && <dd><a href={c.mapsUrl} rel="noopener noreferrer" className="mt-2 inline-flex min-h-touch items-center underline">Cómo llegar (abre Google Maps)</a></dd>}
        </div>
        <div>
          <dt className={label}>Horarios</dt>
          {c.hours.map((h, i) => <dd key={i} className="mt-1">{h}</dd>)}
        </div>
        {c.phone && <div><dt className={label}>Teléfono</dt><dd className="mt-1"><a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`} className="inline-flex min-h-touch items-center underline">{c.phone}</a></dd></div>}
        {c.email && <div><dt className={label}>Email</dt><dd className="mt-1"><a href={`mailto:${c.email}`} className="inline-flex min-h-touch items-center underline">{c.email}</a></dd></div>}
        <div>
          <dt className={label}>Instagram</dt>
          <dd className="mt-1"><a href={c.instagram} rel="noopener noreferrer" className="inline-flex min-h-touch items-center underline">{c.instagramHandle}</a></dd>
        </div>
      </dl>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Cómo llegar</h2>
          <ul className="mt-3 space-y-2">{c.howToGet.map((h) => <li key={h} className="flex gap-3"><IconCheck className="mt-0.5 size-5 text-violeta-oscuro" />{h}</li>)}</ul>
        </section>
        <section className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><IconCard className="size-6 text-violeta-oscuro" />Medios de pago</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{c.payment.map((m) => <li key={m} className="rounded-full bg-lila/40 px-3 py-1">{m}</li>)}</ul>
          <p className="mt-4">{c.insurance}</p>
        </section>
      </div>
      <Link href="/pedir-turno" className="mt-10 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white">Pedir turno</Link>
    </main>
  )
}
