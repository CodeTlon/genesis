import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent, getGallery } from '@genesis/db/content'
import { GalleryGrid } from '@/components/gallery-grid'
import { IconArrowRight, IconCheck, IconShield, IconSparkle } from '@/components/icons'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Conocé nuestro espacio, el equipamiento y los tratamientos de GENESIS.',
}

export default async function Galeria() {
  const [items, disclaimer] = await Promise.all([getGallery(), getContent('disclaimer')])
  const puntos = [
    { icon: IconSparkle, text: 'Equipos de tecnología actual' },
    { icon: IconShield, text: 'Instrumental esterilizado y material descartable' },
    { icon: IconCheck, text: 'Un espacio tranquilo y cuidado' },
  ]
  return (
    <main>
      <section className="bg-gradient-to-b from-lila/40 to-marmol">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <p className="font-label text-sm uppercase tracking-widest text-violeta-oscuro">Galería</p>
          <h1 className="g-blur-in mt-2 text-3xl font-normal uppercase tracking-[0.08em] md:text-4xl">Conocé el espacio</h1>
          <p className="mt-4 max-w-2xl text-lg">Un vistazo a cómo trabajamos: el equipamiento, los productos y los tratamientos. Tocá cualquier foto para verla más grande.</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {puntos.map(({ icon: Icon, text }) => <li key={text} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft"><Icon className="size-5 text-violeta-oscuro" />{text}</li>)}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="mb-6">{items.length} {items.length === 1 ? 'foto' : 'fotos'}</p>
        <GalleryGrid items={items.map((f) => ({ id: f.id, image: f.image, alt: f.alt }))} />
        <p className="mt-8 text-sm">Las imágenes son ilustrativas. {disclaimer}</p>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-card bg-gradient-to-br from-violeta-oscuro to-tinta p-8 text-white md:p-10">
          <div>
            <h2 className="text-2xl font-normal uppercase tracking-[0.08em]">¿Querés conocernos?</h2>
            <p className="mt-2 max-w-xl">Pedí tu turno y te esperamos para una primera consulta, sin apuro.</p>
          </div>
          <Link href="/pedir-turno" className="inline-flex min-h-touch items-center gap-2 rounded-control bg-white px-8 text-tinta hover:bg-lila">Pedir turno<IconArrowRight className="size-5" /></Link>
        </div>
      </div>
    </main>
  )
}
