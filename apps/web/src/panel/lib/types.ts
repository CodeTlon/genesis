export type Alert = 'diabetes' | 'anticoagulantes' | 'antiagregados' | 'embarazo' | 'marcapasos' | 'alergia' | 'circulacion' | 'menor'

export const ALERT_LABEL: Record<Alert, string> = {
  diabetes: 'Diabetes',
  anticoagulantes: 'Anticoagulantes',
  antiagregados: 'Antiagregados',
  embarazo: 'Embarazo/lactancia',
  marcapasos: 'Marcapasos/implantes',
  alergia: 'Alergia',
  circulacion: 'Problemas circulatorios',
  menor: 'Menor de edad',
}

export type Patient = {
  id: string
  firstName: string
  lastName: string
  dni: string
  birthDate: string // yyyy-mm-dd o ''
  phone: string
  address: string
  occupation: string
  insurance: string
  emergencyContact: string
  guardian: string
  firstVisit: string
  nationality: string
  sex: string
  heightCm: string
  weightKg: string
  bloodGroup: string
  otherActivities: string
  alerts: Alert[]
}

/** Antecedentes estructurados: lo que Inés marca como "muy importante". Cada marca puede generar una alerta visible en la ficha. */
export const ANTECEDENTE_ITEMS: { id: string; label: string; alert?: Alert }[] = [
  { id: 'diabetes', label: 'Diabetes', alert: 'diabetes' },
  { id: 'circulacion', label: 'Problemas circulatorios / várices', alert: 'circulacion' },
  { id: 'anticoagulantes', label: 'Anticoagulantes / trastornos de coagulación', alert: 'anticoagulantes' },
  { id: 'alergias', label: 'Alergias (látex, medicamentos, anestésicos, yodo)', alert: 'alergia' },
  { id: 'embarazo', label: 'Embarazo / lactancia', alert: 'embarazo' },
  { id: 'marcapasos', label: 'Marcapasos o implantes metálicos', alert: 'marcapasos' },
  { id: 'hipertension', label: 'Hipertensión' },
  { id: 'cardiopatia', label: 'Cardiopatía' },
  { id: 'neuropatia', label: 'Neuropatía' },
  { id: 'inmunosupresion', label: 'Inmunosupresión' },
  { id: 'infecciosas', label: 'Enfermedades infecciosas' },
  { id: 'cirugias', label: 'Cirugías previas en pies' },
  // Resto de los antecedentes de la ficha en papel de Inés
  { id: 'antiagregados', label: 'Antiagregados', alert: 'antiagregados' },
  { id: 'artritis', label: 'Artritis' },
  { id: 'artrosis', label: 'Artrosis' },
  { id: 'dermatologicos', label: 'Dermatológicos' },
  { id: 'respiratorio', label: 'Problema respiratorio' },
  { id: 'traumatologicos', label: 'Traumatológicos' },
  { id: 'reumatologicos', label: 'Reumatológicos' },
  { id: 'colesterol', label: 'Colesterol' },
  { id: 'trigliceridos', label: 'Triglicéridos' },
]

/** Bloque de diabetes de la ficha (solo se completa si corresponde). */
export type DiabetesInfo = { tipo: string; evolucion: string; ulceras: string; complicaciones: string; tratamiento: string }
export const EMPTY_DIABETES: DiabetesInfo = { tipo: '', evolucion: '', ulceras: '', complicaciones: '', tratamiento: '' }

export type Antecedentes = { version: number; flags: Record<string, boolean>; notes: string; medication: string; footwear: string; activity: string; familiares: string; diabetes: DiabetesInfo; createdAt: string }

export type CaseStatus = 'open' | 'closed'
export type Case = {
  id: string
  patientId: string
  title: string
  reason: string
  status: CaseStatus
  openedAt: string
  closedAt?: string
  conclusion: string
  suggestions: string
}

export type FootType = 'egipcio' | 'griego' | 'romano'
export const FOOT_TYPE_LABEL: Record<FootType, string> = { egipcio: 'Egipcio', griego: 'Griego', romano: 'Romano (cuadrado)' }
export const FOOT_TYPE_HINT: Record<FootType, string> = {
  egipcio: 'El dedo gordo es el más largo y los demás bajan en escalera.',
  griego: 'El segundo dedo es más largo que el gordo.',
  romano: 'Los tres primeros dedos están casi a la par.',
}

export type FootMarker = {
  side: 'left' | 'right'
  view: 'plantar' | 'dorsal'
  zone: string
  finding: string
  severity: 1 | 2 | 3
  state: 'a_tratar' | 'tratado'
  note?: string
}

export type EntryPayload = Record<string, unknown> & { markers?: FootMarker[]; footType?: FootType }

export type Addendum = { id: string; author: string; reason: string; text: string; at: string }

export type Entry = {
  id: string
  patientId: string
  caseId?: string
  templateCode: 'B'
  templateVersion: number
  payload: EntryPayload
  status: 'draft' | 'signed'
  author: string
  createdAt: string
  signedAt?: string
  addenda: Addendum[]
}


export type PhotoKind = 'inicial' | 'evolucion' | 'final'
export type Photo = { id: string; createdBy: string; patientId: string; caseId?: string; entryId?: string; kind: PhotoKind; takenAt: string; createdAt: string }
export const PHOTO_KIND_LABEL: Record<PhotoKind, string> = { inicial: 'Inicial', evolucion: 'Evolución', final: 'Final' }
