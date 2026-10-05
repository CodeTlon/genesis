import type { TemplateCode } from './types'

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
  default?: string | number | boolean | string[]
}

export type Template = {
  code: TemplateCode
  name: string
  version: number
  /** Propuesta a validar con la profesional: no son protocolos oficiales. */
  status: 'propuesta'
  fields: Field[]
  /** Días sugeridos para el próximo turno (editable) */
  followupDays?: number
}

export const TEMPLATES: Record<TemplateCode, Template> = {
  A: {
    code: 'A', name: 'Anamnesis general', version: 1, status: 'propuesta',
    fields: [
      { id: 'motivo', label: 'Motivo de consulta', type: 'longtext' },
      { id: 'antecedentes', label: 'Antecedentes', type: 'multi', options: ['Diabetes', 'Hipertensión', 'Cardiopatía', 'Várices / trastornos circulatorios', 'Neuropatía', 'Tiroides', 'Inmunosupresión', 'Trastornos de coagulación / anticoagulantes', 'Epilepsia', 'Enfermedades infecciosas'] },
      { id: 'alergias', label: 'Alergias', type: 'multi', options: ['Látex', 'Medicamentos', 'Acrílicos / gel', 'Anestésicos', 'Yodo', 'Tinturas'] },
      { id: 'medicacion', label: 'Medicación actual', type: 'longtext', hint: 'Nombre, dosis y frecuencia' },
      { id: 'embarazo', label: 'Embarazo / lactancia', type: 'select', options: ['No', 'Embarazo', 'Lactancia'] },
      { id: 'marcapasos', label: 'Marcapasos o implantes metálicos', type: 'bool' },
      { id: 'cirugias', label: 'Cirugías previas', type: 'text', advanced: true },
      { id: 'habitos', label: 'Hábitos', type: 'text', advanced: true },
      { id: 'calzado', label: 'Calzado habitual', type: 'text', advanced: true },
      { id: 'plantillas', label: '¿Usa plantillas ortopédicas?', type: 'select', options: ['No', 'Sí'], advanced: true },
      { id: 'plantillasTipo', label: 'Tipo / fecha de confección', type: 'text', advanced: true },
    ],
  },
  B: {
    code: 'B', name: 'Podología — evolución', version: 1, status: 'propuesta', followupDays: 45,
    fields: [
      { id: 'motivo', label: 'Motivo', type: 'text' },
      { id: 'mapa', label: 'Mapa de pies', type: 'footmap', hint: 'Tocá una zona para marcar un hallazgo' },
      { id: 'hallazgos', label: 'Hallazgos', type: 'multi', options: ['Heloma', 'Hiperqueratosis', 'Onicolisis', 'Onicocriptosis (uña encarnada)', 'Micosis', 'Verrugas plantares', 'Fisuras', 'Deformidades'] },
      { id: 'procedimiento', label: 'Procedimiento realizado', type: 'longtext' },
      { id: 'indicaciones', label: 'Indicaciones', type: 'longtext' },
      { id: 'sensibilidad', label: 'Screening pie diabético: sensibilidad', type: 'select', options: ['Conservada', 'Disminuida', 'Ausente'], advanced: true },
      { id: 'pulsos', label: 'Pulsos pedios', type: 'select', options: ['Presentes', 'Disminuidos', 'Ausentes'], advanced: true },
      { id: 'materiales', label: 'Materiales e instrumental (ciclo de esterilización)', type: 'text', advanced: true },
      { id: 'plantillasIndicadas', label: 'Plantillas indicadas / confeccionadas', type: 'text', advanced: true },
    ],
  },
  C: {
    code: 'C', name: 'Depilación láser', version: 1, status: 'propuesta', followupDays: 30,
    fields: [
      { id: 'zona', label: 'Zona', type: 'text' },
      { id: 'sesion', label: 'N.º de sesión', type: 'number' },
      { id: 'fototipo', label: 'Fototipo de Fitzpatrick', type: 'select', options: ['I', 'II', 'III', 'IV', 'V', 'VI'] },
      { id: 'contra', label: 'Contraindicaciones revisadas (marcar las que aplican)', type: 'multi', options: ['Isotretinoína / fotosensibilizantes', 'Embarazo', 'Bronceado reciente', 'Tatuaje en la zona', 'Queloides', 'Herpes en la zona'] },
      { id: 'longitud', label: 'Longitud de onda', type: 'select', options: ['755 nm', '808 nm', '940 nm', '1064 nm'] },
      { id: 'energia', label: 'Energía', type: 'number', unit: 'J/cm²' },
      { id: 'pulso', label: 'Ancho de pulso', type: 'number', unit: 'ms', advanced: true },
      { id: 'frecuencia', label: 'Frecuencia', type: 'number', unit: 'Hz', advanced: true },
      { id: 'colorVello', label: 'Color / grosor del vello', type: 'text', advanced: true },
      { id: 'parche', label: 'Prueba de parche (fecha)', type: 'date', advanced: true },
      { id: 'reaccion', label: 'Reacción', type: 'text' },
      { id: 'indicaciones', label: 'Indicaciones posteriores', type: 'longtext' },
    ],
  },
}

/** Plantillas propuestas del prompt que todavía no están en la demo */
export const PROXIMAS = [
  'D · Depilación con cera', 'E · Facial', 'F · Microneedling / exosomas / PDRN', 'G · Corporal',
  'H · Despigmentante', 'I · Uñas soft gel', 'J · Cejas y pestañas',
]

export const FOOT_ZONES = {
  plantar: ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Metatarsos', 'Arco', 'Talón'],
  dorsal: ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Empeine', 'Tobillo'],
} as const

export const FOOT_FINDINGS = ['Heloma', 'Hiperqueratosis', 'Onicolisis', 'Uña encarnada', 'Micosis', 'Verruga plantar', 'Fisura', 'Deformidad', 'Dolor']
