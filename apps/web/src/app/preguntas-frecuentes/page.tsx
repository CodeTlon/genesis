import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent } from '@genesis/db/content'
import { IconArrowRight, IconChevronDown } from '@/components/icons'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Respuestas a las dudas más comunes sobre turnos, tratamientos, medios de pago y cuidados en Genesis Estética Integral.',
}

export default async function Preguntas() {
  const faq = await getContent('faqGeneral')
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Preguntas frecuentes</h1>
      <p className="mt-3">Las dudas que más nos hacen. Si no encontrás la tuya, pedí tu turno y te la respondemos.</p>
      <div className="g-stagger mt-8 space-y-3">
        {faq.map((f) => (
          <details key={f.q} className="group rounded-card bg-white p-5 shadow-soft">
            <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<IconChevronDown className="size-5 transition-transform group-open:rotate-180" /></summary>
            <p className="mt-2">{f.a}</p>
          </details>
        ))}
      </div>
      <Link href="/pedir-turno" className="mt-10 inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-6 text-white hover:bg-tinta">Pedir turno<IconArrowRight className="size-5" /></Link>
    </main>
  )
}
