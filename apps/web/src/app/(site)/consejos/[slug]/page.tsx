import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getContent } from '@genesis/db/content'
import { IconArrowLeft, IconArrowRight } from '@/components/icons'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const t = (await getContent('tips')).find((x) => x.slug === slug)
  return t ? { title: t.title, description: t.text } : {}
}

export default async function Consejo({ params }: Props) {
  const { slug } = await params
  const t = (await getContent('tips')).find((x) => x.slug === slug)
  if (!t) notFound()
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/consejos" className="inline-flex min-h-touch items-center gap-2 underline underline-offset-4"><IconArrowLeft className="size-5" />Todos los consejos</Link>
      <p className="mt-6 text-sm">{t.minutes} min de lectura</p>
      <h1 className="mt-1 text-3xl font-normal uppercase tracking-[0.06em]">{t.title}</h1>
      <div className="mt-6 space-y-4 text-lg">{t.body.map((p) => <p key={p}>{p}</p>)}</div>
      <p className="mt-8 rounded-card bg-lila/40 p-4">Esta nota es orientativa y no reemplaza la consulta profesional.</p>
      <Link href="/pedir-turno" className="mt-8 inline-flex min-h-touch items-center gap-2 rounded-control bg-violeta-oscuro px-6 text-white hover:bg-tinta">Pedir turno<IconArrowRight className="size-5" /></Link>
    </main>
  )
}
