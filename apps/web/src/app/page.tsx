import Image from 'next/image'
import Link from 'next/link'
import { getContent, getGroups } from '@genesis/db/content'
import { GrupoCard } from '@/components/grupo-card'
import { Reveal } from '@genesis/ui/reveal'

export const revalidate = 60

export default async function Home() {
  const [hero, section, steps, groups] = await Promise.all([getContent('hero'), getContent('groupsSection'), getContent('steps'), getGroups()])
  return (
    <main>
      <section className="bg-gradient-to-b from-lila/40 to-marmol">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">{hero.eyebrow}</p>
            <h1 className="g-blur-in mt-4 text-4xl font-normal uppercase leading-tight tracking-[0.06em] md:text-5xl">{hero.title}</h1>
            <p className="g-blur-in-2 mt-6 max-w-lg">{hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pedir-turno" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white hover:bg-tinta">{hero.primaryCta}</Link>
              <Link href="/servicios" className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-6 text-violeta-oscuro hover:bg-lila/40">{hero.secondaryCta}</Link>
            </div>
          </div>
          {hero.image && <Image src={hero.image} alt="Genesis Estética Integral" width={480} height={480} priority sizes="(min-width:768px) 40vw, 80vw" className="mx-auto aspect-square w-full min-w-0 max-w-md rounded-full object-cover shadow-soft" />}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-normal uppercase tracking-[0.08em]">{section.title}</h2>
          <p className="mt-3 max-w-2xl">{section.text}</p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => <Reveal key={g.slug} delay={(i % 3) * 90} className="h-full"><GrupoCard g={g} /></Reveal>)}
        </div>
      </section>

      {steps.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <Reveal className="grid gap-6 rounded-card bg-malva p-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i}>
                <p className="font-label text-sm uppercase tracking-widest">Paso {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1">{s.text}</p>
              </div>
            ))}
          </Reveal>
        </section>
      )}
    </main>
  )
}
