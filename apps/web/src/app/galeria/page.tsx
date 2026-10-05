import type { Metadata } from 'next'
import Image from 'next/image'
import { getContent, getGallery } from '@genesis/db/content'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Conocé nuestro equipamiento y los productos que usamos en Genesis Estética Integral.',
}

export default async function Galeria() {
  const [items, disclaimer] = await Promise.all([getGallery(), getContent('disclaimer')])
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Galería</h1>
      <p className="mt-3 max-w-2xl">Un vistazo al equipamiento y a los productos que usamos.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <li key={f.id} className="relative aspect-[4/3] overflow-hidden rounded-card shadow-soft">
            <Image src={f.image} alt={f.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm">{disclaimer}</p>
    </main>
  )
}
