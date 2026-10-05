import type { Metadata } from 'next'
import { getContent, getGroups } from '@genesis/db/content'
import { Reveal } from '@genesis/ui/reveal'
import { GrupoCard } from '@/components/grupo-card'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Podología, tratamientos faciales y corporales, depilación, cejas, pestañas y uñas en Córdoba.',
}

export default async function Servicios() {
  const [groups, disclaimer] = await Promise.all([getGroups(), getContent('disclaimer')])
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Servicios</h1>
      <p className="mt-3 max-w-2xl">Elegí una categoría para ver los tratamientos, cómo son las sesiones y las preguntas más frecuentes.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => <Reveal key={g.slug} delay={(i % 3) * 90} className="h-full"><GrupoCard g={g} /></Reveal>)}
      </div>
      <p className="mt-10">{disclaimer}</p>
    </main>
  )
}
