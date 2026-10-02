import type { Metadata } from 'next'
import { getGroups } from '@genesis/db/content'
import { TurnoForm } from './turno-form'

export const metadata: Metadata = {
  title: 'Pedir turno',
  description: 'Pedí tu turno en Genesis Estética Integral. Te contactamos para confirmarlo.',
}

export default async function PedirTurno({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const { servicio } = await searchParams
  const grupos = (await getGroups()).map((g) => ({ slug: g.slug, name: g.name }))
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Pedir turno</h1>
      <p className="mt-3 mb-8">Dejanos tus datos y te contactamos para confirmar día y horario.</p>
      <TurnoForm servicio={servicio} grupos={grupos} />
    </main>
  )
}
