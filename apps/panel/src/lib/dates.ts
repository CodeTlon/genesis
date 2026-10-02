const TZ = 'America/Argentina/Cordoba'
const OFFSET_H = 3 // Córdoba es UTC-3 todo el año (sin horario de verano)

/** yyyy-mm-dd de hoy en Córdoba */
export function todayKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + n))
  return dt.toISOString().slice(0, 10)
}

/** ISO UTC para "dayKey HH:MM" hora de Córdoba */
export function localToIso(dayKey: string, hhmm: string): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  const [hh, mm] = hhmm.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh + OFFSET_H, mm)).toISOString()
}

/** { day: yyyy-mm-dd, minutes: minutos desde 00:00 } hora de Córdoba */
export function isoToLocal(iso: string): { day: string; minutes: number } {
  const d = new Date(new Date(iso).getTime() - OFFSET_H * 3600_000)
  return { day: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() }
}

export function hhmm(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function fmtTime(iso: string): string {
  return hhmm(isoToLocal(iso).minutes)
}

/** dd/mm/aaaa */
export function fmtDate(key: string): string {
  const [y, m, d] = key.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function fmtDateLong(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function age(birth: string, today = todayKey()): number {
  const [by, bm, bd] = birth.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}

export function isBirthdayToday(birth: string, today = todayKey()): boolean {
  return birth.slice(5) === today.slice(5)
}
