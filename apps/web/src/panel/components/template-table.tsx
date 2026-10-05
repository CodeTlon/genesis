'use client'
import { Fragment, useState } from 'react'
import { IconChevronDown } from './icons'

export type TemplateRow = { code: string; name: string; area: string; version: number; basic: string[]; extra: string[]; followupDays?: number }

/** Tabla de plantillas: lo esencial en una fila; los campos se despliegan al pedirlos. */
export function TemplateTable({ rows }: { rows: TemplateRow[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const th = 'px-4 py-3 text-left font-semibold'
  return (
    <div className="relative overflow-x-auto rounded-card bg-white shadow-soft">
      <table className="w-full min-w-[40rem] text-left">
        <caption className="sr-only">Plantillas de ficha propuestas</caption>
        <thead className="border-b border-lila/60 bg-lila/20">
          <tr><th scope="col" className={th}>Plantilla</th><th scope="col" className={th}>Área</th><th scope="col" className={th}>Campos básicos</th><th scope="col" className={th}>Modo completo</th><th scope="col" className={th}>Control sugerido</th><th scope="col" className={th}><span className="sr-only">Detalle</span></th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const on = open === r.code
            return (
              <Fragment key={r.code}>
                <tr className="border-b border-lila/30 align-middle">
                  <td className="px-4 py-3"><p className="font-semibold">{r.name}</p><p className="text-sm">Propuesta · versión {r.version}</p></td>
                  <td className="px-4 py-3"><span className="rounded-full bg-lila/60 px-3 py-0.5 text-sm font-semibold">{r.area}</span></td>
                  <td className="px-4 py-3">{r.basic.length}</td>
                  <td className="px-4 py-3">{r.basic.length + r.extra.length}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.followupDays ? `${r.followupDays} días` : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" aria-expanded={on} aria-controls={`t-${r.code}`} onClick={() => setOpen(on ? null : r.code)} className="inline-flex min-h-touch items-center gap-1 rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro transition-colors hover:bg-lila/40">
                      {on ? 'Ocultar' : 'Ver campos'}<IconChevronDown className={`size-4 transition-transform ${on ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                </tr>
                {on && (
                  <tr id={`t-${r.code}`} className="border-b border-lila/30 bg-lila/10">
                    <td colSpan={6} className="g-enter px-4 py-4">
                      <p className="font-semibold">Campos básicos</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">{r.basic.map((f) => <li key={f} className="rounded-full bg-lila/40 px-3 py-0.5">{f}</li>)}</ul>
                      {r.extra.length > 0 && (<><p className="mt-4 font-semibold">Se suman en el modo completo</p><ul className="mt-2 flex flex-wrap gap-1.5">{r.extra.map((f) => <li key={f} className="rounded-full bg-white px-3 py-0.5 ring-1 ring-lila/60">{f}</li>)}</ul></>)}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
