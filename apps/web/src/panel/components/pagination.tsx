import Link from 'next/link'

/** Páginas a mostrar: la primera, la última y las vecinas de la actual, con "…" en los saltos (1 … 4 5 6 … 20). */
export function pageWindow(page: number, pages: number): (number | '…')[] {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))
  const out: (number | '…')[] = []
  let prev = 0
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (n - prev > 1) out.push('…')
    out.push(n)
    prev = n
  }
  return out
}

export const parsePage = (raw: string | undefined, pages: number) => Math.min(Math.max(Math.floor(Number(raw)) || 1, 1), Math.max(pages, 1))

/**
 * Paginación con enlaces reales (funciona sin JavaScript y se puede compartir o volver con Atrás).
 * `params` son los demás parámetros de la URL que hay que conservar (búsqueda, pestaña).
 */
export function Pagination({ base, params = {}, page, total, pageSize, noun = 'resultados' }: { base: string; params?: Record<string, string | undefined>; page: number; total: number; pageSize: number; noun?: string }) {
  const pages = Math.max(Math.ceil(total / pageSize), 1)
  if (total <= pageSize) return total > 0 ? <p className="text-base text-tinta-suave" aria-live="polite">{total} {noun}</p> : null
  const href = (n: number) => {
    const q = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1]))
    if (n > 1) q.set('page', String(n))
    const s = q.toString()
    return s ? `${base}?${s}` : base
  }
  const from = (page - 1) * pageSize + 1, to = Math.min(page * pageSize, total)
  const btn = 'inline-flex min-h-touch min-w-touch items-center justify-center rounded-control border px-3 font-semibold transition-colors'
  const off = `${btn} cursor-not-allowed border-tinta/20 text-tinta/40`
  const on = `${btn} border-tinta/40 bg-white hover:bg-lila/40`
  return (
    <nav aria-label="Paginación" className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-base text-tinta-suave" aria-live="polite">Mostrando {from}–{to} de {total} {noun}</p>
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>{page > 1 ? <Link href={href(page - 1)} scroll={false} rel="prev" className={on}>Anterior</Link> : <span aria-disabled="true" className={off}>Anterior</span>}</li>
        {pageWindow(page, pages).map((n, i) => (
          <li key={`${n}-${i}`}>
            {n === '…' ? <span aria-hidden className="px-1 text-tinta-suave">…</span>
              : n === page ? <span aria-current="page" aria-label={`Página ${n}, actual`} className={`${btn} border-violeta-oscuro bg-violeta-oscuro text-white`}>{n}</span>
              : <Link href={href(n)} scroll={false} aria-label={`Ir a la página ${n}`} className={on}>{n}</Link>}
          </li>
        ))}
        <li>{page < pages ? <Link href={href(page + 1)} scroll={false} rel="next" className={on}>Siguiente</Link> : <span aria-disabled="true" className={off}>Siguiente</span>}</li>
      </ul>
    </nav>
  )
}
