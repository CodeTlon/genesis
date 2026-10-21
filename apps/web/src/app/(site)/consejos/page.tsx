import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent } from '@genesis/db/content'
import { IconArrowRight } from '@/components/icons'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Consejos',
  description: 'Consejos breves para cuidar tus pies, tu piel y tus uñas en casa.',
}

export default async function Consejos() {
  const tips = await getContent('tips')
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Consejos</h1>
      <p className="mt-3 max-w-2xl">Notas cortas para cuidarte también en casa. Orientativas: no reemplazan la consulta profesional.</p>
      <ul className="g-stagger mt-10 grid auto-rows-fr gap-6 md:grid-cols-2">
        {tips.map((t) => (
          <li key={t.slug} className="h-full">
            <Link href={`/consejos/${t.slug}`} className="group flex h-full flex-col rounded-card bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm">{t.minutes} min de lectura</p>
              <h2 className="mt-2 text-xl font-semibold">{t.title}</h2>
              <p className="mt-2 flex-1">{t.text}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-violeta-oscuro">Leer<IconArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
