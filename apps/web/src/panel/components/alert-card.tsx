'use client'
import { useState, type ReactNode } from 'react'
import { ALERT_HINT, ALERT_LABEL, ALERT_LEVEL, sortAlerts, topLevel, type Alert, type AlertLevel } from '@/panel/lib/types'
import { IconDrop, IconHeart, IconPerson, IconPlus, IconPulse, IconWarning } from './icons'

const ICON: Record<Alert, ReactNode> = {
  diabetes: <IconDrop className="size-4" />,
  anticoagulantes: <IconPlus className="size-4" />,
  antiagregados: <IconPlus className="size-4" />,
  embarazo: <IconHeart className="size-4" />,
  marcapasos: <IconPulse className="size-4" />,
  alergia: <IconWarning className="size-4" />,
  circulacion: <IconPulse className="size-4" />,
  menor: <IconPerson className="size-4" />,
}

// Siempre ícono + texto (nunca solo color). La franja lateral toma el color de la alerta más grave.
const STRIPE: Record<AlertLevel, string> = { alto: 'border-l-error-texto', medio: 'border-l-aviso-texto', info: 'border-l-info-texto' }
const CHIP: Record<AlertLevel, string> = { alto: 'bg-error-fondo text-error-texto', medio: 'bg-aviso-fondo text-aviso-texto', info: 'bg-info-fondo text-info-texto' }

/**
 * Bloque «Alertas clínicas»: una línea por alerta con su ícono, el nombre y qué implica. Muestra las 3 más graves y el resto con «Ver todas».
 * Es una sola lista accesible («Alertas clínicas»), de la más grave a la menos grave.
 */
export function AlertCard({ alerts, max = 3 }: { alerts: Alert[]; max?: number }) {
  const [all, setAll] = useState(false)
  if (!alerts.length) return null
  const sorted = sortAlerts(alerts)
  const shown = all ? sorted : sorted.slice(0, max)
  const hidden = sorted.length - shown.length
  return (
    <section aria-labelledby="alertas-t" className={`rounded-card border border-l-4 border-tinta/10 bg-white p-4 shadow-soft ${STRIPE[topLevel(alerts)]}`}>
      <h2 id="alertas-t" className="flex items-center gap-2 text-base font-semibold">
        <IconWarning className="size-5 text-tinta-suave" />Alertas clínicas <span className="font-normal text-tinta-suave">({alerts.length})</span>
      </h2>
      <ul aria-label="Alertas clínicas: requiere precaución" className="mt-2 divide-y divide-tinta/10">
        {shown.map((a) => (
          <li key={a} className="g-reveal flex items-center gap-3 py-2 first:pt-1 last:pb-0">
            <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-full ${CHIP[ALERT_LEVEL[a]]}`}>{ICON[a]}</span>
            <span className="min-w-0 leading-tight">
              <span className="block font-semibold">{ALERT_LABEL[a]}</span>
              {ALERT_HINT[a] && <span className="block text-tinta-suave">{ALERT_HINT[a]}</span>}
            </span>
          </li>
        ))}
      </ul>
      {(hidden > 0 || all) && sorted.length > max && (
        <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-violeta-oscuro hover:underline">
          {all ? 'Ver menos' : `Ver todas (${sorted.length})`}
        </button>
      )}
    </section>
  )
}

/** Indicador de una línea para la lista de pacientes: «3 alertas» con el color de la más grave; el detalle queda para lectores de pantalla. */
export function AlertSummary({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null
  const level = topLevel(alerts)
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold ${CHIP[level]}`}>
      <IconWarning className="size-4" />
      <span aria-hidden>{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span>
      <span className="sr-only">Alertas clínicas: {sortAlerts(alerts).map((a) => ALERT_LABEL[a]).join(', ')}</span>
    </span>
  )
}
