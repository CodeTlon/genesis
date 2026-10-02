import type { Metadata } from 'next'
import Image from 'next/image'
import { AVISO } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Conocé nuestro equipamiento y los productos que usamos en Genesis Estética Integral.',
}

// Solo imágenes de equipos y productos, sin personas (ver docs/imagenes.md, categoría 3).
const FOTOS = [
  { src: 'img-10', alt: 'Equipo de depilación láser con pantalla de control' },
  { src: 'img-11', alt: 'Cabezales del equipo de crio radiofrecuencia' },
  { src: 'img-21', alt: 'Cabezal de radiofrecuencia fraccionada' },
  { src: 'img-17', alt: 'Mesa con productos y accesorios para tratamientos faciales' },
  { src: 'img-29', alt: 'Estante con esmaltes de colores para uñas soft gel' },
  { src: 'img-1', alt: 'Herramientas de madera para maderoterapia' },
]

export default function Galeria() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Galería</h1>
      <p className="mt-3 max-w-2xl">Un vistazo al equipamiento y a los productos que usamos.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FOTOS.map((f) => (
          <li key={f.src} className="relative aspect-[4/3] overflow-hidden rounded-card shadow-soft">
            <Image src={`/img/${f.src}.webp`} alt={f.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm">{AVISO}</p>
    </main>
  )
}
