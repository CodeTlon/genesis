import type { ReactNode } from 'react'
import { ALERT_LABEL, type Alert } from '@/panel/lib/types'
import { IconDrop, IconHeart, IconPerson, IconPlus, IconPulse, IconWarning } from './icons'

const ICON: Record<Alert, ReactNode> = {
  diabetes: <IconDrop className="size-4" />,
  anticoagulantes: <IconPlus className="size-4" />,
  embarazo: <IconHeart className="size-4" />,
  marcapasos: <IconPulse className="size-4" />,
  alergia: <IconWarning className="size-4" />,
  menor: <IconPerson className="size-4" />,
}

/** Nivel de precaución: alto (rojo), medio (ámbar) e informativo (celeste). Siempre acompañado de ícono y texto, nunca solo color. */
const TONE: Record<Alert, string> = {
  anticoagulantes: 'bg-rose-100 text-rose-950 ring-rose-700/50',
  marcapasos: 'bg-rose-100 text-rose-950 ring-rose-700/50',
  diabetes: 'bg-amber-100 text-amber-950 ring-amber-700/50',
  alergia: 'bg-amber-100 text-amber-950 ring-amber-700/50',
  embarazo: 'bg-sky-100 text-sky-950 ring-sky-700/50',
  menor: 'bg-sky-100 text-sky-950 ring-sky-700/50',
}

/**
 * Siempre ícono + texto en la versión completa. `compact` muestra solo círculos con ícono (hasta `max`, más "+N") para espacios chicos como
 * la agenda y las tarjetas de pacientes; el texto completo queda disponible para lectores de pantalla y en el detalle.
 */
export { TONE as ALERT_TONE }
export function AlertBadges({ alerts, compact = false, max = 2 }: { alerts: Alert[]; compact?: boolean; max?: number }) {
  if (!alerts.length) return null
  if (compact) {
    const shown = alerts.slice(0, max)
    const rest = alerts.length - shown.length
    return (
      <ul className="flex flex-none items-center gap-1" aria-label={`Alertas clínicas: ${alerts.map((a) => ALERT_LABEL[a]).join(', ')}`}>
        {shown.map((a) => (
          <li key={a} title={ALERT_LABEL[a]} className={`grid size-6 place-items-center rounded-full ring-1 ${TONE[a]}`}>{ICON[a]}</li>
        ))}
        {rest > 0 && <li aria-hidden className="grid h-6 min-w-6 place-items-center rounded-full bg-amber-100 px-1 text-xs font-semibold text-amber-950 ring-1 ring-amber-700/40">+{rest}</li>}
      </ul>
    )
  }
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Alertas clínicas: requiere precaución">
      {alerts.map((a) => (
        <li key={a} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ${TONE[a]}`}>
          {ICON[a]}
          <span>{ALERT_LABEL[a]}</span>
        </li>
      ))}
    </ul>
  )
}
