import type { Metadata } from 'next'
import { GrupoCard } from '@/components/grupo-card'
import { GRUPOS, AVISO } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Podología, tratamientos faciales y corporales, depilación, cejas, pestañas y uñas en Córdoba.',
}

export default function Servicios() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Servicios</h1>
      <p className="mt-3 max-w-2xl">Elegí una categoría para ver los tratamientos, cómo son las sesiones y las preguntas más frecuentes.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GRUPOS.map((g) => <GrupoCard key={g.slug} g={g} cantidad={g.servicios.length} />)}
      </div>
      <p className="mt-10 text-sm">{AVISO}</p>
    </main>
  )
}
