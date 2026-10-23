'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

type Item = { id: string; label: string; badge?: number }

/** Pestañas con la pestaña activa en la URL (?tab=). Flechas, Inicio y Fin mueven entre pestañas; cada pestaña es un enlace real, así que el botón Atrás funciona. */
export function Tabs({ items, current, base }: { items: Item[]; current: string; base: string }) {
  const router = useRouter()
  const refs = useRef<(HTMLAnchorElement | null)[]>([])
  const href = (id: string) => `${base}?tab=${id}`
  function onKey(e: React.KeyboardEvent, i: number) {
    const last = items.length - 1
    const to = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1
    if (to < 0) return
    e.preventDefault()
    refs.current[to]?.focus()
    router.replace(href(items[to].id), { scroll: false })
  }
  return (
    <div role="tablist" aria-label="Secciones de la ficha" className="sticky top-0 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-lila/60 bg-marmol/95 px-4 backdrop-blur print:hidden">
      {items.map((t, i) => {
        const active = t.id === current
        return (
          <Link key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={active} aria-controls={`panel-${t.id}`} tabIndex={active ? 0 : -1}
            ref={(el) => { refs.current[i] = el }} href={href(t.id)} replace scroll={false} onKeyDown={(e) => onKey(e, i)}
            className={`relative inline-flex min-h-touch shrink-0 items-center gap-2 px-4 text-lg font-semibold ${active ? 'text-violeta-oscuro' : 'text-tinta-suave hover:text-tinta'}`}>
            {t.label}
            {!!t.badge && <span className="grid min-w-6 place-items-center rounded-full bg-violeta-oscuro px-1.5 text-base text-white">{t.badge}</span>}
            <span aria-hidden className={`absolute inset-x-3 bottom-0 h-1 origin-center rounded-full bg-violeta-oscuro transition-transform duration-200 ${active ? 'scale-x-100' : 'scale-x-0'}`} />
          </Link>
        )
      })}
    </div>
  )
}
