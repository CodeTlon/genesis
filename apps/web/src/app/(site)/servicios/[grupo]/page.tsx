import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getContent, getGroup, getGroups } from '@genesis/db/content'
import { IconArrowRight, IconCard, IconChevronDown, IconClock, IconShield } from '@/components/icons'

export const revalidate = 60

type Props = { params: Promise<{ grupo: string }> }

export async function generateStaticParams() {
  return (await getGroups()).map((g) => ({ grupo: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = await getGroup((await params).grupo)
  if (!g) return {}
  return { title: `${g.name} en Córdoba`, description: `${g.intro} GENESIS, Córdoba.` }
}

export default async function GrupoPage({ params }: Props) {
  const [g, disclaimer] = await Promise.all([getGroup((await params).grupo), getContent('disclaimer')])
  if (!g) notFound()

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: g.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  // Grilla de 6 columnas: la cantidad de tarjetas por fila siempre da cuenta exacta (nunca queda un hueco).
  const n = g.services.length
  const span = (i: number) => {
    if (n === 1) return 'lg:col-span-6'
    if (n === 2 || n === 4) return 'lg:col-span-3'
    if (n === 5) return i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
    return 'lg:col-span-2' // 3 y 6
  }
  const lastAlone = n % 2 === 1 ? 'md:max-lg:last:col-span-2' : ''

  return (
    <main>
      <section className="bg-gradient-to-b from-lila/40 to-marmol">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <nav aria-label="Ruta" className="text-base"><Link href="/servicios" className="underline underline-offset-4">Servicios</Link> / {g.name}</nav>
            <h1 className="g-blur-in mt-4 text-3xl font-normal uppercase tracking-[0.08em] md:text-4xl">{g.name}</h1>
            <p className="mt-4 max-w-xl text-lg">{g.intro}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Resumen">
              <li className="rounded-full bg-white px-4 py-1.5 shadow-soft">{n} {n === 1 ? 'tratamiento' : 'tratamientos'}</li>
              <li className="rounded-full bg-white px-4 py-1.5 shadow-soft">Primera consulta de evaluación</li>
            </ul>
            <Link href={`/pedir-turno?servicio=${g.slug}`} className="mt-8 inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-6 text-white hover:bg-tinta">Pedir turno<IconArrowRight className="size-5" /></Link>
          </div>
          {g.image && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-soft">
              <Image src={g.image} alt={`${g.name}: imagen ilustrativa`} fill priority sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {n > 1 && (
          <nav aria-label="En esta página" className="-mx-4 overflow-x-auto px-4 pb-2">
            <ul className="flex w-max gap-2">
              {g.services.map((s) => <li key={s.slug}><a href={`#${s.slug}`} className="inline-flex min-h-touch items-center whitespace-nowrap rounded-full border border-violeta-oscuro/50 bg-white px-4 transition-colors hover:bg-violeta-oscuro hover:text-white">{s.name}</a></li>)}
            </ul>
          </nav>
        )}

        {/* Cada tarjeta ocupa 6 filas de la grilla (subgrid): rótulo, título, resumen, datos, aviso y botón quedan alineados entre tarjetas de una misma fila. */}
        <ul className="g-stagger mt-6 grid gap-x-6 gap-y-0 md:grid-cols-2 lg:grid-cols-6">
          {g.services.map((s, i) => (
            <li key={s.slug} id={s.slug} className={`mb-6 grid scroll-mt-24 row-span-6 grid-rows-subgrid rounded-card bg-white p-6 shadow-soft transition-shadow hover:shadow-lg ${span(i)} ${lastAlone}`}>
              <p className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">{s.hook}</p>
              <h2 className="mt-2 text-xl font-semibold">{s.name}</h2>
              <p className="mt-3">{s.summary}</p>
              {s.sessions || s.price ? (
                <dl className="mt-5 space-y-3 border-t border-lila/50 pt-4">
                  {s.sessions && <div><dt className="flex items-center gap-2 text-sm"><IconClock className="size-5 text-violeta-oscuro" />Sesiones</dt><dd className="ml-7 font-semibold">{s.sessions}</dd></div>}
                  {s.price && <div><dt className="flex items-center gap-2 text-sm"><IconCard className="size-5 text-violeta-oscuro" />Valor orientativo</dt><dd className="ml-7 font-semibold">{s.price}</dd></div>}
                </dl>
              ) : <div />}
              {s.notice ? <p className="mt-4 flex gap-3 rounded-control bg-lila/40 p-3"><IconShield className="mt-0.5 size-5 shrink-0 text-violeta-oscuro" /><span>{s.notice}</span></p> : <div />}
              <div className="pt-6"><Link href={`/pedir-turno?servicio=${g.slug}`} className="inline-flex min-h-touch items-center justify-center gap-2 rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro transition-colors hover:bg-violeta-oscuro hover:text-white">Pedir turno<IconArrowRight className="size-5" /></Link></div>
            </li>
          ))}
        </ul>

        {g.faq.length > 0 && (
          <section className="mt-16 grid gap-8 md:grid-cols-[1fr_1.6fr]" aria-labelledby="faq">
            <div>
              <h2 id="faq" className="text-2xl font-normal uppercase tracking-[0.06em]">Preguntas frecuentes</h2>
              <p className="mt-3">Lo que más nos preguntan sobre {g.name.toLowerCase()}. Si te queda una duda, pedí tu turno y te la respondemos.</p>
            </div>
            <div className="space-y-3">
              {g.faq.map((f) => (
                <details key={f.q} className="group rounded-card bg-white p-5 shadow-soft">
                  <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<IconChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" /></summary>
                  <p className="mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-base">{disclaimer}</p>
      </div>
      {g.faq.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, '\\u003c') }} />}
    </main>
  )
}
