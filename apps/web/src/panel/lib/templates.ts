export type FieldType = 'text' | 'longtext' | 'number' | 'bool' | 'select' | 'multi' | 'date' | 'footmap' | 'digits'

export type Field = {
  id: string
  label: string
  type: FieldType
  options?: string[]
  hint?: string
  unit?: string
  /** Solo se muestra en "modo completo". El modo simple muestra pocos campos. */
  advanced?: boolean
}

export type Template = {
  code: 'B'
  name: string
  version: number
  /** Propuesta a validar con la profesional: no es un protocolo oficial. */
  status: 'propuesta'
  fields: Field[]
}

/** Examen exploratorio de la ficha de Inés, un valor por pie. */
const EXAMEN: [string, string, string[]][] = [
  ['temperatura', 'Temperatura', ['Normal', 'Frío', 'Caliente']],
  ['humedad', 'Humedad', ['Normal', 'Seca', 'Húmeda']],
  ['coloracion', 'Coloración', ['Normal', 'Pálida', 'Cianótica', 'Eritematosa']],
  ['textura', 'Textura', ['Normal', 'Atrófica', 'Hiperqueratósica']],
  ['edema', 'Edema', ['No', 'Leve', 'Moderado', 'Severo']],
  ['inflamacion', 'Inflamación', ['No', 'Sí']],
]
/** Patologías por dedo (1° a 5°) de cada pie. */
const PATOLOGIAS: [string, string][] = [
  ['dactilopatias', 'Dactilopatías'], ['onicopatias', 'Onicopatías'], ['helomas', 'Helomas'], ['dermatopatias', 'Dermatopatías'], ['patologias_varias', 'Patologías varias'],
]

/** Evolución podológica. Los antecedentes tienen su propia sección estructurada (ANTECEDENTE_ITEMS). */
export const TEMPLATE: Template = {
  code: 'B', name: 'Podología — evolución', version: 1, status: 'propuesta',
  fields: [
    { id: 'motivo', label: 'Motivo de la visita', type: 'text' },
    { id: 'mapa', label: 'Mapa de pies', type: 'footmap', hint: 'Elegí el tipo de pie y tocá una zona para marcar un hallazgo' },
    { id: 'hallazgos', label: 'Hallazgos', type: 'multi', options: ['Heloma', 'Hiperqueratosis', 'Onicolisis', 'Onicocriptosis (uña encarnada)', 'Micosis', 'Verrugas plantares', 'Fisuras', 'Deformidades'] },
    { id: 'procedimiento', label: 'Procedimiento realizado', type: 'longtext' },
    { id: 'indicaciones', label: 'Indicaciones', type: 'longtext' },
    { id: 'tratamiento_preventivo', label: 'Tratamiento preventivo', type: 'longtext' },
    { id: 'control', label: 'Control (próxima visita)', type: 'text', hint: 'Ej: en 45 días' },
    ...EXAMEN.flatMap(([id, label, options]) => [
      { id: `${id}_der`, label: `${label} (pie derecho)`, type: 'select' as const, options, advanced: true },
      { id: `${id}_izq`, label: `${label} (pie izquierdo)`, type: 'select' as const, options, advanced: true },
    ]),
    ...PATOLOGIAS.map(([id, label]) => ({ id, label, type: 'digits' as const, hint: 'Anotá lo que corresponda en cada dedo', advanced: true })),
    { id: 'sensibilidad', label: 'Screening pie diabético: sensibilidad', type: 'select', options: ['Conservada', 'Disminuida', 'Ausente'], advanced: true },
    { id: 'pulsos', label: 'Pulsos pedios', type: 'select', options: ['Presentes', 'Disminuidos', 'Ausentes'], advanced: true },
    { id: 'materiales', label: 'Materiales e instrumental (ciclo de esterilización)', type: 'text', advanced: true },
    { id: 'plantillasIndicadas', label: 'Plantillas indicadas / confeccionadas', type: 'text', advanced: true },
  ],
}

export const FOOT_ZONES = {
  plantar: ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Metatarsos', 'Arco', 'Talón'],
  dorsal: ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Empeine', 'Tobillo'],
} as const

export const FOOT_FINDINGS = ['Callo', 'Dureza', 'Heloma', 'Hiperqueratosis', 'Onicolisis', 'Uña encarnada', 'Micosis', 'Verruga plantar', 'Fisura', 'Deformidad', 'Dolor']

/** Texto de un campo "digits": { der: [d1..d5], izq: [d1..d5] } -> "Der.: 2° heloma · Izq.: —". */
export function formatDigits(v: unknown): string {
  if (!v || typeof v !== 'object') return '—'
  const rec = v as Record<string, string[]>
  const parts = (['der', 'izq'] as const).flatMap((side) => (rec[side] ?? []).map((t, i) => (t?.trim() ? `${side === 'der' ? 'Der.' : 'Izq.'}: ${i + 1}° ${t.trim()}` : '')).filter(Boolean))
  return parts.length ? parts.join(' · ') : '—'
}
