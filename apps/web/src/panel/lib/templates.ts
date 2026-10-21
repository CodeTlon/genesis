export type FieldType = 'text' | 'longtext' | 'number' | 'bool' | 'select' | 'multi' | 'date' | 'footmap'

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

/** Evolución podológica. Los antecedentes tienen su propia sección estructurada (ANTECEDENTE_ITEMS). */
export const TEMPLATE: Template = {
  code: 'B', name: 'Podología — evolución', version: 1, status: 'propuesta',
  fields: [
    { id: 'motivo', label: 'Motivo de la visita', type: 'text' },
    { id: 'mapa', label: 'Mapa de pies', type: 'footmap', hint: 'Elegí el tipo de pie y tocá una zona para marcar un hallazgo' },
    { id: 'hallazgos', label: 'Hallazgos', type: 'multi', options: ['Heloma', 'Hiperqueratosis', 'Onicolisis', 'Onicocriptosis (uña encarnada)', 'Micosis', 'Verrugas plantares', 'Fisuras', 'Deformidades'] },
    { id: 'procedimiento', label: 'Procedimiento realizado', type: 'longtext' },
    { id: 'indicaciones', label: 'Indicaciones', type: 'longtext' },
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
