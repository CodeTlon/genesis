import Link from 'next/link'
import { getContent, getGroups } from '@genesis/db/content'
import { CountUp } from '@/components/count-up'
import { GroupGrid } from '@/components/group-grid'
import { IconArrowRight, IconCalendar, IconCheck, IconChevronDown, IconClock, IconPin, IconQuote, IconShield, WHY_ICONS } from '@/components/icons'
import { Reveal } from '@genesis/ui/reveal'

export const revalidate = 60

const eyebrow = 'font-label text-sm uppercase tracking-widest text-violeta-oscuro'
const h2 = 'mt-2 text-2xl font-normal uppercase tracking-[0.08em] md:text-3xl'

export default async function Home() {
  const [hero, section, steps, groups, stats, whyUs, testimonials, note, faq, tips, contact] = await Promise.all([
    getContent('hero'), getContent('groupsSection'), getContent('steps'), getGroups(), getContent('stats'), getContent('whyUs'),
    getContent('testimonials'), getContent('testimonialsNote'), getContent('faqGeneral'), getContent('tips'), getContent('contact'),
  ])
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-lila/40 to-marmol">
        <div aria-hidden className="g-aurora absolute inset-0"><span className="g-blob g-blob-1" /><span className="g-blob g-blob-2" /><span className="g-blob g-blob-3" /></div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className={eyebrow}>{hero.eyebrow}</p>
            <h1 className="g-blur-in mt-4 text-4xl font-normal uppercase leading-tight tracking-[0.06em] md:text-5xl">{hero.title}</h1>
            <p className="g-blur-in-2 mt-6 max-w-lg">{hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pedir-turno" className="inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-6 text-white hover:bg-tinta">{hero.primaryCta}<IconArrowRight className="size-5" /></Link>
              <Link href="/servicios" className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-6 text-violeta-oscuro hover:bg-lila/40">{hero.secondaryCta}</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              <li className="flex items-center gap-2"><IconShield className="size-5 text-violeta-oscuro" />Material esterilizado</li>
              <li className="flex items-center gap-2"><IconCalendar className="size-5 text-violeta-oscuro" />Turnos con seguimiento</li>
            </ul>
          </div>
          <aside aria-label="Horarios y accesos rápidos" className="g-enter rounded-card bg-white/75 p-6 shadow-soft ring-1 ring-white/70 backdrop-blur md:p-8">
            <p className={eyebrow}>Te esperamos</p>
            <ul className="mt-3 space-y-2">
              {contact.hours.map((h) => <li key={h} className="flex items-center gap-3"><IconClock className="size-5 text-violeta-oscuro" />{h}</li>)}
              <li className="flex items-center gap-3"><IconPin className="size-5 text-violeta-oscuro" />{contact.address}</li>
            </ul>
            <p className="mt-6 font-semibold">¿Qué te interesa?</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {groups.map((g) => <li key={g.slug}><Link href={`/servicios/${g.slug}`} className="inline-flex min-h-touch items-center rounded-full border border-violeta-oscuro/60 bg-white px-4 text-tinta transition-colors hover:bg-violeta-oscuro hover:text-white">{g.name}</Link></li>)}
            </ul>
          </aside>
        </div>
      </section>

      {/* Números */}
      <section aria-label="Genesis en números" className="mx-auto max-w-6xl px-4">
        <Reveal className="-mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-lila/50 shadow-soft md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-6 text-center">
              <p className="text-4xl font-normal text-violeta-oscuro md:text-5xl"><CountUp to={s.value} suffix={s.suffix} /></p>
              <p className="mt-1">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Servicios */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal>
          <p className={eyebrow}>Servicios</p>
          <h2 className={h2}>{section.title}</h2>
          <p className="mt-3 max-w-2xl">{section.text}</p>
        </Reveal>
        <GroupGrid groups={groups} />
      </section>

      {/* Por qué elegirnos */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className={eyebrow}>Por qué elegirnos</p>
            <h2 className={h2}>Cuidado de verdad, sin apuro</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((w, i) => {
              const Icon = WHY_ICONS[w.icon] ?? IconCheck
              return (
                <Reveal key={w.title} delay={i * 90} className="h-full">
                  <article className="group h-full rounded-card border border-lila/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violeta-oscuro/40 hover:shadow-soft">
                    <span className="grid size-12 place-items-center rounded-full bg-lila/50 text-violeta-oscuro transition-colors group-hover:bg-violeta-oscuro group-hover:text-white"><Icon className="size-6" /></span>
                    <h3 className="mt-4 text-lg font-semibold">{w.title}</h3>
                    <p className="mt-2">{w.text}</p>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cómo es tu primera visita */}
      {steps.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <Reveal>
            <p className={eyebrow}>Tu primera visita</p>
            <h2 className={h2}>Así de simple</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 120} className="h-full">
                <article className="relative h-full rounded-card bg-malva p-8">
                  <span aria-hidden className="absolute right-6 top-4 text-6xl font-light text-white/60">{i + 1}</span>
                  <p className="font-label text-sm uppercase tracking-widest">Paso {i + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1">{s.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Testimonios */}
      <section aria-label="Opiniones" className="overflow-hidden bg-lila/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className={eyebrow}>Opiniones</p>
            <h2 className={h2}>Lo que cuentan quienes nos visitan</h2>
          </Reveal>
        </div>
        <div className="g-marquee mt-10">
          <div className="g-marquee-track gap-6 pl-6">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex gap-6" aria-hidden={copy === 1 || undefined}>
                {testimonials.map((t) => (
                  <li key={t.name} className="w-80 flex-none rounded-card bg-white p-6 shadow-soft">
                    <IconQuote className="size-7 text-violeta-oscuro" />
                    <p className="mt-3">{t.text}</p>
                    <p className="mt-4 font-semibold">{t.name}</p>
                    <p className="text-sm">{t.service}</p>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl px-4 text-sm">{note}</p>
      </section>

      {/* Preguntas frecuentes */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.4fr] md:py-20">
        <Reveal>
          <p className={eyebrow}>Preguntas frecuentes</p>
          <h2 className={h2}>Lo que más nos preguntan</h2>
          <p className="mt-3">Si no encontrás tu duda, escribinos y te respondemos.</p>
          <Link href="/preguntas-frecuentes" className="mt-6 inline-flex min-h-touch items-center gap-2 text-violeta-oscuro underline underline-offset-4">Ver todas las preguntas<IconArrowRight className="size-5" /></Link>
        </Reveal>
        <Reveal delay={120}>
          <div className="space-y-3">
            {faq.slice(0, 4).map((f) => (
              <details key={f.q} className="group rounded-card bg-white p-5 shadow-soft">
                <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<IconChevronDown className="size-5 transition-transform group-open:rotate-180" /></summary>
                <p className="mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Consejos */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={eyebrow}>Consejos</p>
            <h2 className={h2}>Cuidate también en casa</h2>
          </div>
          <Link href="/consejos" className="inline-flex min-h-touch items-center gap-2 text-violeta-oscuro underline underline-offset-4">Ver todos<IconArrowRight className="size-5" /></Link>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {tips.slice(0, 3).map((t, i) => (
            <Reveal key={t.slug} delay={i * 90} className="h-full">
              <article className="h-full list-none">
                <Link href={`/consejos/${t.slug}`} className="group flex h-full flex-col rounded-card bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm">{t.minutes} min de lectura</p>
                  <h3 className="mt-2 text-lg font-semibold">{t.title}</h3>
                  <p className="mt-2 flex-1">{t.text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-violeta-oscuro">Leer<IconArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Llamado final */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <Reveal className="overflow-hidden rounded-card bg-gradient-to-br from-violeta-oscuro to-tinta p-8 text-white md:p-12">
          <h2 className="text-2xl font-normal uppercase tracking-[0.08em] md:text-3xl">Pedí tu turno</h2>
          <p className="mt-3 max-w-xl">Contanos qué necesitás y te confirmamos el día y el horario. No hace falta tener cuenta.</p>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
            {contact.hours.slice(0, 2).map((h) => <li key={h} className="flex items-center gap-2"><IconClock className="size-5" />{h}</li>)}
            <li className="flex items-center gap-2"><IconPin className="size-5" />{contact.address}</li>
          </ul>
          <Link href="/pedir-turno" className="mt-8 inline-flex min-h-touch items-center gap-2 rounded-control bg-white px-8 text-tinta hover:bg-lila">Pedir turno<IconArrowRight className="size-5" /></Link>
        </Reveal>
      </section>
    </main>
  )
}
