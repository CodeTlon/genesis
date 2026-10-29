'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

export type FilterGroup = { key: string; label: string; value: string; options: { value: string; label: string }[] }

/** URL del listado con el texto y los filtros; el primer valor de cada grupo es el predeterminado y no viaja en la URL. */
const href = (base: string, q: string, groups: FilterGroup[], override?: { key: string; value: string }) => {
  const p = new URLSearchParams()
  if (q.trim()) p.set('q', q.trim())
  for (const g of groups) {
    const v = override?.key === g.key ? override.value : g.value
    if (v && v !== g.options[0].value) p.set(g.key, v)
  }
  const s = p.toString()
  return s ? `${base}?${s}` : base
}

const field = 'block min-h-touch w-full rounded-control border border-tinta/25 bg-white px-3 disabled:opacity-60'

/**
 * Barra de filtros de un listado: búsqueda en vivo y un desplegable por filtro. Todo queda en la URL (se puede compartir y funciona el botón Atrás);
 * cambiar cualquier filtro vuelve a la primera página. Sin JavaScript funciona enviando el formulario («Aplicar»). En el celular los filtros se pliegan.
 */
export function FilterBar({ base, q, placeholder, groups }: { base: string; q: string; placeholder: string; groups: FilterGroup[] }) {
  const router = useRouter()
  const [value, setValue] = useState(q)
  const [seenQ, setSeenQ] = useState(q)
  const [show, setShow] = useState(false)
  const [pending, start] = useTransition()
  const nActive = groups.filter((g) => g.value !== g.options[0].value).length
  const active = !!q.trim() || nActive > 0

  // Si la búsqueda cambia desde afuera (por ejemplo «Limpiar filtros»), el campo la sigue; lo que uno escribe no se pisa.
  if (q !== seenQ) {
    setSeenQ(q)
    if (q !== value.trim()) setValue(q)
  }

  // Solo se navega al escribir cuando el texto cambió; los desplegables navegan por su cuenta.
  useEffect(() => {
    if (value.trim() === q.trim()) return
    const t = setTimeout(() => start(() => router.replace(href(base, value, groups), { scroll: false })), 250)
    return () => clearTimeout(t)
  }, [value, q, router, base, groups])

  const go = (key: string, v: string) => start(() => router.replace(href(base, value, groups, { key, value: v }), { scroll: false }))

  return (
    <form role="search" action={base} onSubmit={(e) => e.preventDefault()} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-64">
          <label className="sr-only" htmlFor={`${base}-q`}>{placeholder}</label>
          <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>
          <input id={`${base}-q`} name="q" type="search" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" placeholder={placeholder} className={`${field} pl-11 pr-4 placeholder:text-tinta-suave`} />
        </div>
        <button type="button" onClick={() => setShow((v) => !v)} aria-expanded={show} className="inline-flex min-h-touch items-center gap-2 rounded-control border border-tinta/25 bg-white px-4 font-semibold md:hidden">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          Filtros{nActive > 0 && <span className="grid min-w-6 place-items-center rounded-full bg-violeta-oscuro px-1.5 text-sm text-white">{nActive}</span>}
          <svg aria-hidden viewBox="0 0 24 24" className={`size-4 transition-transform duration-200 ${show ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
      <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${show ? 'g-reveal' : 'max-md:hidden'}`}>
        {groups.map((g) => (
          <label key={g.key} className="block">
            <span className="mb-1 block font-semibold">{g.label}</span>
            <select name={g.key} value={g.value} onChange={(e) => go(g.key, e.target.value)} className={field}>
              {g.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <noscript><button type="submit" className="min-h-touch rounded-control bg-violeta-oscuro px-5 font-semibold text-white">Aplicar</button></noscript>
        {active && <Link href={base} replace scroll={false} className="inline-flex min-h-[44px] items-center font-semibold text-violeta-oscuro hover:underline">Limpiar filtros</Link>}
        <span role="status" className="text-tinta-suave">{pending ? 'Actualizando…' : ''}</span>
      </div>
    </form>
  )
}
