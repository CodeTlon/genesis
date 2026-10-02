import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GRUPOS, AVISO, grupoPorSlug, serviciosDe } from '@/lib/site'

type Props = { params: Promise<{ grupo: string }> }

export function generateStaticParams() {
  return GRUPOS.map((g) => ({ grupo: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = grupoPorSlug((await params).grupo)
  if (!g) return {}
  return { title: `${g.nombre} en Córdoba`, description: `${g.intro} Genesis Estética Integral, Colorado 5827, Córdoba.` }
}

export default async function GrupoPage({ params }: Props) {
  const g = grupoPorSlug((await params).grupo)
  if (!g) notFound()
  const servicios = serviciosDe(g)

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: g.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <nav aria-label="Ruta" className="text-sm"><Link href="/servicios" className="underline">Servicios</Link> / {g.nombre}</nav>
      <h1 className="mt-4 text-3xl font-light uppercase tracking-[0.15em]">{g.nombre}</h1>
      <p className="mt-3 text-lg">{g.intro}</p>

      {servicios.length > 1 && (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="En esta página">
          {servicios.map((s) => (
            <li key={s.slug}><a href={`#${s.slug}`} className="inline-flex min-h-touch items-center rounded-control bg-lila/50 px-4">{s.nombre}</a></li>
          ))}
        </ul>
      )}

      <div className="mt-12 space-y-14">
        {servicios.map((s) => (
          <section key={s.slug} id={s.slug} className="scroll-mt-24">
            <div className="grid gap-6 md:grid-cols-[1fr_16rem] md:items-start">
              <div>
                <p className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">{s.gancho}</p>
                <h2 className="mt-2 text-2xl font-light uppercase tracking-[0.12em]">{s.nombre}</h2>
                <p className="mt-3">{s.resumen}</p>
                <Link href={`/pedir-turno?servicio=${g.slug}`} className="mt-5 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-5 text-white">Pedir turno</Link>
              </div>
              {s.imagenes.length > 0 && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                  <Image src={`/img/img-${s.imagenes[0]}.webp`} alt={`${s.nombre}: imagen ilustrativa`} fill sizes="256px" className="object-cover" />
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-light uppercase tracking-[0.12em]">Preguntas frecuentes</h2>
        <div className="mt-4 space-y-3">
          {g.faq.map((f) => (
            <details key={f.q} className="rounded-card bg-white p-4 shadow-soft">
              <summary className="min-h-touch cursor-pointer py-2 font-semibold">{f.q}</summary>
              <p className="pb-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm">{AVISO}</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </main>
  )
}
