import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getContent } from '@genesis/db/content'
import { IconArrowRight, IconCheck } from '@/components/icons'
import { Reveal } from '@genesis/ui/reveal'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conocé a Genesis Estética Integral: podología y estética en un mismo lugar, en Córdoba.',
}

export default async function Nosotros() {
  const [about, team] = await Promise.all([getContent('about'), getContent('team')])
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">{about.title}</h1>
      <p className="mt-6 text-lg">{about.lead}</p>
      <p className="mt-4">{about.body}</p>

      {team.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-normal uppercase tracking-[0.06em]">Equipo</h2>
          <ul className="mt-4 space-y-3">
            {team.map((m, i) => (
              <li key={i} className="flex items-center gap-4 rounded-card bg-white p-5 shadow-soft">
                {m.photo && <Image src={m.photo} alt={`Foto de ${m.name}`} width={72} height={72} className="size-[72px] rounded-full object-cover" />}
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p>{m.role}{m.license ? ` · Matrícula ${m.license}` : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-12 text-xl font-normal uppercase tracking-[0.06em]">Lo que nos importa</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {about.values.map((v, i) => (
          <Reveal key={v.title} delay={i * 90} className="h-full">
            <div className="h-full rounded-card bg-white p-5 shadow-soft"><h3 className="font-semibold">{v.title}</h3><p className="mt-2">{v.text}</p></div>
          </Reveal>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-normal uppercase tracking-[0.06em]">{about.howTitle}</h2>
      <p className="mt-4">{about.how}</p>

      <h2 className="mt-12 text-xl font-normal uppercase tracking-[0.06em]">Nuestra historia</h2>
      <ol className="mt-6 border-l-2 border-lila">
        {about.timeline.map((t) => (
          <li key={t.year} className="relative pb-6 pl-6 last:pb-0">
            <span aria-hidden className="absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-violeta-oscuro bg-white" />
            <p className="font-semibold">{t.year}</p>
            <p>{t.text}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-normal uppercase tracking-[0.06em]">Higiene y bioseguridad</h2>
      <ul className="mt-4 space-y-3">
        {about.hygiene.map((h) => <li key={h} className="flex gap-3"><IconCheck className="mt-0.5 size-6 text-violeta-oscuro" />{h}</li>)}
      </ul>

      <Link href="/pedir-turno" className="mt-10 inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-6 text-white hover:bg-tinta">Pedir turno<IconArrowRight className="size-5" /></Link>
    </main>
  )
}
