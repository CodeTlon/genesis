export type Alert = 'diabetes' | 'anticoagulantes' | 'embarazo' | 'marcapasos' | 'alergia' | 'menor'

export const ALERT_LABEL: Record<Alert, string> = {
  diabetes: 'Diabetes',
  anticoagulantes: 'Anticoagulantes',
  embarazo: 'Embarazo/lactancia',
  marcapasos: 'Marcapasos/implantes',
  alergia: 'Alergia',
  menor: 'Menor de edad',
}

export type Patient = {
  id: string
  firstName: string
  lastName: string
  dni: string // ficticio e inválido a propósito
  birthDate: string // yyyy-mm-dd
  phone: string
  address?: string
  insurance?: string
  guardian?: string // obligatorio si es menor
  alerts: Alert[]
  consent: { data: 'vigente' | 'pendiente'; imageClinical: 'vigente' | 'pendiente'; imagePublic: 'vigente' | 'pendiente' }
  usesInsoles?: boolean
  medication?: string
}

export type Professional = { id: string; name: string; area: 'Podología' | 'Estética'; color: string }

export type ApptStatus = 'pending' | 'confirmed' | 'in_room' | 'done' | 'no_show' | 'cancelled'
export const STATUS_LABEL: Record<ApptStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_room: 'En sala',
  done: 'Atendido',
  no_show: 'Ausente',
  cancelled: 'Cancelado',
}

export type Service = { id: string; name: string; area: 'Podología' | 'Estética'; durationMin: number; followupDays: number; templateCode?: TemplateCode }

export type Appointment = {
  id: string
  patientId: string
  serviceId: string
  professionalId: string
  resource: string
  start: string // ISO UTC
  durationMin: number
  status: ApptStatus
}

export type TemplateCode = 'A' | 'B' | 'C'

export type FootMarker = { side: 'left' | 'right'; view: 'plantar' | 'dorsal'; zone: string; finding: string; severity: 1 | 2 | 3; note?: string }

export type EntryPayload = Record<string, unknown> & { markers?: FootMarker[] }

export type Addendum = { id: string; author: string; reason: string; text: string; at: string }

export type Entry = {
  id: string
  patientId: string
  templateCode: TemplateCode
  templateVersion: number
  payload: EntryPayload
  status: 'draft' | 'signed'
  author: string
  createdAt: string
  signedAt?: string
  addenda: Addendum[]
}
