// Formatos de fecha para las pantallas, siempre en horario de Córdoba.
const TZ = 'America/Argentina/Cordoba'
const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)

/** "hoy", "ayer" o dd/mm. */
export function when(iso: string): string {
  const d = new Date(iso), now = new Date()
  if (dayKey(d) === dayKey(now)) return 'hoy'
  if (dayKey(d) === dayKey(new Date(now.getTime() - 864e5))) return 'ayer'
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', timeZone: TZ }).format(d)
}

/** dd/mm/aaaa. */
export const fullDate = (iso: string) => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ }).format(new Date(iso))

export const hourInCordoba = () => Number(new Intl.DateTimeFormat('es-AR', { hour: 'numeric', hour12: false, timeZone: TZ }).format(new Date()))
export const longToday = () => {
  const t = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(new Date())
  return t.charAt(0).toUpperCase() + t.slice(1)
}
