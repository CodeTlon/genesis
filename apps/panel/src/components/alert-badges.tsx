import { ALERT_LABEL, type Alert } from '@/lib/types'

const ICON: Record<Alert, string> = { diabetes: '◐', anticoagulantes: '✚', embarazo: '♡', marcapasos: '⚡', alergia: '⚠', menor: '☺' }

/** Siempre texto + ícono (nunca solo ícono). `compact` muestra solo el ícono con título para la agenda, pero conserva el texto accesible. */
export function AlertBadges({ alerts, compact = false }: { alerts: Alert[]; compact?: boolean }) {
  if (!alerts.length) return null
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Alertas clínicas: requiere precaución">
      {alerts.map((a) => (
        <li key={a} title={ALERT_LABEL[a]} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-950 ring-1 ring-amber-700/40">
          <span aria-hidden>{ICON[a]}</span>
          <span className={compact ? 'sr-only' : ''}>{ALERT_LABEL[a]}</span>
        </li>
      ))}
    </ul>
  )
}
