import Image from 'next/image'
import Link from 'next/link'
import { GrupoCard } from '@/components/grupo-card'
import { Reveal } from '@genesis/ui/reveal'
import { GRUPOS, SITE } from '@/lib/site'

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-b from-lila/40 to-marmol">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">Podología y estética · Córdoba</p>
            <h1 className="mt-4 text-4xl font-light uppercase leading-tight tracking-[0.12em] md:text-5xl">Cuidamos tus pies y tu piel</h1>
            <p className="mt-6 max-w-lg">Un lugar tranquilo para cuidarte. Atención personalizada en podología, tratamientos faciales y corporales, depilación, cejas, pestañas y uñas.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pedir-turno" className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white">Pedir turno</Link>
              <Link href="/servicios" className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-6 text-violeta-oscuro">Ver servicios</Link>
            </div>
          </div>
          <Image src="/img/logo.webp" alt="Genesis Estética Integral" width={480} height={480} priority sizes="(min-width:768px) 40vw, 80vw" className="mx-auto rounded-full shadow-soft" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-light uppercase tracking-[0.15em]">¿Qué estás buscando?</h2>
          <p className="mt-3 max-w-2xl">Agrupamos los tratamientos por tema para que encuentres rápido lo que necesitás.</p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GRUPOS.map((g) => <GrupoCard key={g.slug} g={g} cantidad={g.servicios.length} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <Reveal className="grid gap-6 rounded-card bg-malva p-8 md:grid-cols-3">
          {[
            ['1', 'Pedí tu turno', 'Desde esta web o por Instagram. No hace falta tener cuenta.'],
            ['2', 'Te confirmamos', 'Te avisamos el día y el horario disponibles.'],
            ['3', 'Venís y te cuidamos', `Te esperamos en ${SITE.address}.`],
          ].map(([n, t, d]) => (
            <div key={n}>
              <p className="font-label text-sm uppercase tracking-widest">Paso {n}</p>
              <h3 className="mt-1 text-lg font-semibold">{t}</h3>
              <p className="mt-1">{d}</p>
            </div>
          ))}
        </Reveal>
      </section>
    </main>
  )
}
