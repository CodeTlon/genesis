'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { IconArrowLeft, IconArrowRight } from './icons'

type Item = { id: string; image: string; alt: string }

// Alturas que se alternan para armar un mosaico; el CSS en columnas acomoda las fotos sin dejar huecos, sea cual sea la cantidad.
const SHAPES = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[4/3]']

/** Mosaico de fotos con título al pasar el mouse y visor ampliado (flechas y teclado). */
export function GalleryGrid({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const dlg = useRef<HTMLDialogElement>(null)
  const go = (n: number) => setOpen((n + items.length) % items.length)

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go((open ?? 0) + 1); if (e.key === 'ArrowLeft') go((open ?? 0) - 1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const cur = open === null ? null : items[open]

  return (
    <>
      <ul className="g-stagger columns-2 gap-4 lg:columns-3">
        {items.map((f, i) => (
          <li key={f.id} className="mb-4 break-inside-avoid">
            <button type="button" onClick={() => { setOpen(i); dlg.current?.showModal() }} aria-label={`Ampliar: ${f.alt}`}
              className={`group relative block w-full overflow-hidden rounded-card shadow-soft ${SHAPES[i % SHAPES.length]}`}>
              <Image src={f.image} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/85 via-tinta/55 to-transparent p-4 pt-12 text-left text-sm text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">{f.alt}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dlg} className="g-modal !max-w-[min(64rem,calc(100vw-1.5rem))] !p-3 md:!p-4" aria-label="Foto ampliada" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close() }}>
        {cur && (
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-control bg-lila/20 md:aspect-[16/10]">
              <Image src={cur.image} alt={cur.alt} fill sizes="(min-width:1024px) 64rem, 100vw" className="object-contain" />
            </div>
            <figcaption className="mt-3 text-base">{cur.alt}</figcaption>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-sm">{(open ?? 0) + 1} de {items.length}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => go((open ?? 0) - 1)} aria-label="Foto anterior" className="grid size-12 place-items-center rounded-control border border-violeta-oscuro text-violeta-oscuro hover:bg-lila/40"><IconArrowLeft className="size-5" /></button>
                <button type="button" onClick={() => go((open ?? 0) + 1)} aria-label="Foto siguiente" className="grid size-12 place-items-center rounded-control border border-violeta-oscuro text-violeta-oscuro hover:bg-lila/40"><IconArrowRight className="size-5" /></button>
                <button type="button" autoFocus onClick={() => dlg.current?.close()} className="min-h-12 rounded-control bg-violeta-oscuro px-5 text-white hover:bg-tinta">Cerrar</button>
              </div>
            </div>
          </figure>
        )}
      </dialog>
    </>
  )
}
