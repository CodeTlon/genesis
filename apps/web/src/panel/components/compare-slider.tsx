'use client'
import { useState } from 'react'

/**
 * Comparador antes/después: la foto «antes» se recorta con un deslizador. Es un <input type="range"> que ocupa toda la imagen,
 * así funciona con mouse, dedo y teclado (flechas, Inicio y Fin) sin dependencias.
 */
export function CompareSlider({ before, after }: { before: { src: string; label: string }; after: { src: string; label: string } }) {
  const [pos, setPos] = useState(50)
  return (
    <figure className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-card border border-tinta/10 bg-tinta/5 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-violeta-oscuro">
      {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada servida con sesión; no pasa por el optimizador */}
      <img src={after.src} alt={after.label} className="absolute inset-0 size-full object-cover" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element -- ver arriba */}
      <img src={before.src} alt={before.label} className="absolute inset-0 size-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} draggable={false} />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgb(0_0_0/.25)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-soft">
          <svg viewBox="0 0 24 24" className="size-5 text-violeta-oscuro" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></svg>
        </span>
      </span>
      <span aria-hidden className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-0.5 text-sm font-semibold text-white">Inicial</span>
      <span aria-hidden className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-0.5 text-sm font-semibold text-white">Final</span>
      <input type="range" min={0} max={100} step={1} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Comparar la foto inicial con la final" aria-valuetext={`${pos}% de la foto inicial visible`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0 [touch-action:pan-y]" />
    </figure>
  )
}
