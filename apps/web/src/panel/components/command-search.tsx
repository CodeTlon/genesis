'use client'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Alert } from '@/panel/lib/types'

type Result = { id: string; name: string; meta: string; alerts: Alert[] }
type Item = { key: string; label: string; hint?: string; href: string; group: 'Pacientes' | 'Ir a' }

const GO: Item[] = [
  { key: 'g-inicio', label: 'Inicio', href: '/panel/inicio', group: 'Ir a' },
  { key: 'g-pacientes', label: 'Pacientes', href: '/panel/pacientes', group: 'Ir a' },
  { key: 'g-casos', label: 'Casos abiertos', href: '/panel/casos', group: 'Ir a' },
  { key: 'g-atenciones', label: 'Borradores sin firmar', href: '/panel/atenciones?estado=borradores', group: 'Ir a' },
  { key: 'g-nuevo', label: 'Nuevo paciente', href: '/panel/pacientes/nuevo', group: 'Ir a' },
]
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const Ctx = createContext<{ open: () => void }>({ open: () => {} })
export const useCommandSearch = () => useContext(Ctx)

/**
 * Paleta de búsqueda rápida: se abre con «/» o Ctrl/⌘+K (o con el botón), busca pacientes en vivo y deja saltar a cualquier pantalla.
 * Patrón combobox + listbox con <dialog> nativo: flechas para moverse, Enter para abrir, Escape para cerrar.
 */
export function CommandProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dlg = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const opener = useRef<Element | null>(null)
  const uid = useId().replace(/:/g, '')
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [doneFor, setDoneFor] = useState('')
  const [cursor, setCursor] = useState({ q: '', i: 0 })

  const open = useCallback(() => {
    opener.current = document.activeElement
    if (!dlg.current?.open) dlg.current?.showModal()
    setTimeout(() => input.current?.focus(), 0)
  }, [])
  const close = useCallback(() => { dlg.current?.close() }, [])

  // Atajos globales: «/» (si no se está escribiendo en un campo) y Ctrl/⌘+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      const typing = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement || t.isContentEditable
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey)) { e.preventDefault(); open() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Búsqueda en vivo (espera 200 ms y cancela la anterior).
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) return
    const ctl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/clinico/buscar?q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        const j = (await r.json()) as { ok: boolean; results?: Result[] }
        setResults(j.ok ? (j.results ?? []) : [])
        setDoneFor(term)
      } catch { /* cancelada o sin conexión: se deja la lista como estaba */ }
    }, 200)
    return () => { clearTimeout(t); ctl.abort() }
  }, [q])

  const term2 = q.trim()
  const searching = term2.length >= 2
  const loading = searching && doneFor !== term2
  const shownResults = useMemo(() => (searching ? results : []), [searching, results])
  const items: Item[] = useMemo(() => {
    const term = norm(q.trim())
    const patients: Item[] = shownResults.map((p) => ({ key: `p-${p.id}`, label: p.name, hint: p.meta || undefined, href: `/panel/pacientes/${p.id}`, group: 'Pacientes' }))
    const go = GO.filter((g) => !term || norm(g.label).includes(term))
    const all: Item[] = q.trim().length >= 2 && shownResults.length ? [{ key: 'todos', label: `Ver todos los resultados para «${q.trim()}»`, href: `/panel/pacientes?q=${encodeURIComponent(q.trim())}`, group: 'Pacientes' }] : []
    return [...patients, ...all, ...go]
  }, [q, shownResults])

  // El cursor se reinicia solo cuando cambia lo escrito (sin efectos).
  const active = cursor.q === q ? Math.min(cursor.i, Math.max(items.length - 1, 0)) : 0
  const setActive = (f: number | ((a: number) => number)) => setCursor({ q, i: typeof f === 'function' ? f(active) : f })

  function go(it: Item | undefined) {
    if (!it) return
    close()
    router.push(it.href)
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (items.length ? (a + 1) % items.length : 0)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[active]) }
  }

  const groups = (['Pacientes', 'Ir a'] as const).map((g) => ({ g, rows: items.map((it, i) => ({ it, i })).filter((x) => x.it.group === g) })).filter((x) => x.rows.length)

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <dialog ref={dlg} className="g-cmd" aria-label="Búsqueda rápida" onClose={() => { setQ(''); setResults([]); setDoneFor(''); (opener.current as HTMLElement | null)?.focus?.() }}
        onClick={(e) => { if (e.target === dlg.current) close() }}>
        <div className="flex items-center gap-3 border-b border-tinta/10 px-4">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-tinta-suave" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} role="combobox" aria-expanded="true" aria-controls={`${uid}-list`} aria-autocomplete="list"
            aria-activedescendant={items[active] ? `${uid}-${items[active].key}` : undefined} aria-label="Buscar paciente o ir a una pantalla" placeholder="Buscar paciente, DNI o teléfono…" autoComplete="off"
            className="min-h-[56px] w-full border-0 bg-transparent text-base placeholder:text-tinta-suave focus-visible:!outline-none" />
          <kbd aria-hidden className="hidden shrink-0 rounded border border-tinta/20 px-1.5 text-sm text-tinta-suave sm:block">Esc</kbd>
        </div>
        <div id={`${uid}-list`} role="listbox" aria-label="Resultados" className="max-h-[min(60dvh,26rem)] overflow-y-auto p-2">
          {loading && !shownResults.length && <p role="status" className="px-3 py-3 text-tinta-suave">Buscando…</p>}
          {!loading && searching && !shownResults.length && <p role="status" className="px-3 py-3 text-tinta-suave">No encontramos pacientes con «{q.trim()}».</p>}
          {groups.map(({ g, rows }) => (
            <div key={g} role="group" aria-label={g} className="mb-1">
              <p aria-hidden className="px-3 pb-1 pt-2 text-sm font-semibold uppercase tracking-wide text-tinta-suave">{g}</p>
              {rows.map(({ it, i }) => (
                <div key={it.key} id={`${uid}-${it.key}`} role="option" aria-selected={i === active} onMouseMove={() => setActive(i)} onClick={() => go(it)}
                  className={`flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2 ${i === active ? 'bg-lila/40' : ''}`}>
                  <span className="min-w-0"><span className="block truncate font-semibold">{it.label}</span>{it.hint && <span className="block truncate text-tinta-suave">{it.hint}</span>}</span>
                  {i === active && <span aria-hidden className="shrink-0 text-sm text-tinta-suave">Enter</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </dialog>
    </Ctx.Provider>
  )
}

/** Botón que abre la paleta; se ve como un campo de búsqueda (variante `field`) o como botón compacto con ícono. */
export function CommandTrigger({ variant = 'field', label = 'Buscar paciente, DNI o teléfono', className = '' }: { variant?: 'field' | 'icon'; label?: string; className?: string }) {
  const { open } = useCommandSearch()
  if (variant === 'icon') {
    return (
      <button type="button" onClick={open} aria-label="Buscar (atajo: barra inclinada)" className={`grid size-touch place-items-center rounded-control border border-tinta/20 bg-white text-tinta-suave hover:bg-lila/30 ${className}`}>
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>
      </button>
    )
  }
  return (
    <button type="button" onClick={open} aria-label="Buscar paciente (atajo: barra inclinada)" className={`flex min-h-touch w-full items-center gap-3 rounded-control border border-tinta/20 bg-white px-4 text-left text-tinta-suave hover:border-tinta/40 ${className}`}>
      <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>
      <span className="flex-1 truncate">{label}</span>
      <kbd aria-hidden className="hidden rounded border border-tinta/20 px-1.5 text-sm sm:block">/</kbd>
    </button>
  )
}
