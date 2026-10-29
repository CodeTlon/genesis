'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

export type FilterGroup = { key: string; label: string; value: string; options: { value: string; label: string; count?: number }[] }

const href = (base: string, q: string, groups: FilterGroup[], hidden: Record<string, string>, override?: { key: string; value: string }) => {
  const p = new URLSearchParams(hidden)
  if (q.trim()) p.set('q', q.trim())
  for (const g of groups) {
    const v = override?.key === g.key ? override.value : g.value
    if (v && v !== g.options[0].value) p.set(g.key, v) // el primer valor es el predeterminado y no viaja en la URL
  }
  const s = p.toString()
  return s ? `${base}?${s}` : base
}

/**
 * Barra de filtros de un listado: búsqueda en vivo + grupos de opciones (enlaces reales, funcionan sin JavaScript y quedan en la URL).
 * Cambiar cualquier filtro vuelve a la primera página. «Limpiar filtros» aparece solo si hay algo activo.
 */
export function FilterBar({ base, q, placeholder, groups, hidden = {} }: { base: string; q: string; placeholder: string; groups: FilterGroup[]; hidden?: Record<string, string> }) {
  const router = useRouter()
  const [value, setValue] = useState(q)
  const [seenQ, setSeenQ] = useState(q)
  const [pending, start] = useTransition()
  const nActive = groups.filter((g) => g.value !== g.options[0].value).length
  const active = !!q.trim() || nActive > 0
  const [show, setShow] = useState(false) // en el celular los filtros se pliegan para no ocupar la pantalla

  // Si la búsqueda cambia desde afuera (por ejemplo «Limpiar filtros»), el campo la sigue; lo que uno escribe no se pisa.
  if (q !== seenQ) {
    setSeenQ(q)
    if (q !== value.trim()) setValue(q)
  }

  // Solo se navega cuando el texto escrito cambió; los clics en filtros navegan por sus propios enlaces.
  useEffect(() => {
    if (value.trim() === q.trim()) return
    const t = setTimeout(() => start(() => router.replace(href(base, value, groups, hidden), { scroll: false })), 250)
    return () => clearTimeout(t)
  }, [value, q, router, base, groups, hidden])

  return (
    <div className="space-y-3">
      <form role="search" className="relative" onSubmit={(e) => e.preventDefault()} action={base}>
        <label className="sr-only" htmlFor={`${base}-q`}>{placeholder}</label>
        <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>
        <input id={`${base}-q`} name="q" type="search" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" placeholder={placeholder}
          className="block min-h-touch w-full max-w-xl rounded-control border border-tinta/25 bg-white pl-11 pr-4 placeholder:text-tinta-suave" />
        {groups.map((g) => g.value !== g.options[0].value && <input key={g.key} type="hidden" name={g.key} value={g.value} />)}
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <span role="status" className="sr-only">{pending ? 'Buscando…' : ''}</span>
      </form>
      <button type="button" onClick={() => setShow((v) => !v)} aria-expanded={show} className="inline-flex min-h-touch items-center gap-2 rounded-control border border-tinta/25 bg-white px-4 font-semibold md:hidden">
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        Filtros{nActive > 0 && <span className="grid min-w-6 place-items-center rounded-full bg-violeta-oscuro px-1.5 text-sm text-white">{nActive}</span>}
        <svg aria-hidden viewBox="0 0 24 24" className={`size-4 transition-transform duration-200 ${show ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div className={`space-y-2 ${show ? 'g-reveal block' : 'hidden md:block'}`}>
        {groups.map((g) => (
          <div key={g.key} role="group" aria-label={g.label} className="flex items-center gap-2">
            <span className="shrink-0 text-tinta-suave max-sm:sr-only">{g.label}:</span>
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {g.options.map((o) => {
                const on = g.value === o.value
                return (
                  <li key={o.value} className="shrink-0">
                    <Link href={href(base, value, groups, hidden, { key: g.key, value: o.value })} replace scroll={false} aria-current={on ? 'true' : undefined}
                      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 font-semibold transition-colors ${on ? 'border-violeta-oscuro bg-violeta-oscuro text-white' : 'border-tinta/25 bg-white hover:bg-lila/30'}`}>
                      {o.label}{o.count !== undefined && <span className={`text-sm font-normal ${on ? 'text-white/85' : 'text-tinta-suave'}`}>{o.count}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        {active && <Link href={Object.keys(hidden).length ? `${base}?${new URLSearchParams(hidden)}` : base} replace scroll={false} className="inline-flex min-h-[44px] items-center font-semibold text-violeta-oscuro hover:underline">Limpiar filtros</Link>}
      </div>
    </div>
  )
}
