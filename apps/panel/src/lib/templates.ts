import type { TemplateCode } from './types'

export type FieldType = 'text' | 'longtext' | 'number' | 'bool' | 'select' | 'multi' | 'date' | 'footmap' | 'digits' | 'footshape'

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
  /** Para `digits`: zonas extra además de los dedos 1° a 5° (ej. Plantar, Dorsal). */
  zones?: string[]
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
  F: {
    code: 'F', name: 'Ficha podológica inicial', version: 1, status: 'propuesta', followupDays: 7,
    fields: [
      { id: 'motivo', label: 'Motivo de consulta', type: 'longtext' },
      { id: 'ant_alergicos', label: 'Alérgicos', type: 'bool' },
      { id: 'ant_anticoagulantes', label: 'Anticoagulantes', type: 'bool' },
      { id: 'ant_antiagregados', label: 'Antiagregados', type: 'bool' },
      { id: 'ant_artritis', label: 'Artritis', type: 'bool' },
      { id: 'ant_artrosis', label: 'Artrosis', type: 'bool' },
      { id: 'ant_cardiovascular', label: 'Cardiovascular', type: 'bool' },
      { id: 'ant_presion', label: 'Presión arterial', type: 'bool' },
      { id: 'ant_vasculares', label: 'Problemas vasculares', type: 'bool' },
      { id: 'ant_marcapasos', label: 'Marcapasos', type: 'bool' },
      { id: 'ant_dermatologicos', label: 'Dermatológicos', type: 'bool' },
      { id: 'ant_respiratorio', label: 'Problema respiratorio', type: 'bool' },
      { id: 'ant_traumatologicos', label: 'Traumatológicos', type: 'bool' },
      { id: 'ant_reumatologicos', label: 'Reumatológicos', type: 'bool' },
      { id: 'ant_neurologicos', label: 'Neurológicos', type: 'bool' },
      { id: 'ant_infecto', label: 'Enfermedades infecto-contagiosas', type: 'bool' },
      { id: 'ant_cirugias', label: 'Cirugías', type: 'bool' },
      { id: 'ant_colesterol', label: 'Colesterol', type: 'bool' },
      { id: 'ant_trigliceridos', label: 'Triglicéridos', type: 'bool' },
      { id: 'ant_familiares', label: 'Antecedentes familiares', type: 'text' },
      { id: 'ant_otros', label: 'Otros antecedentes', type: 'text' },
      { id: 'diabetes', label: 'Diabetes', type: 'bool' },
      { id: 'diabetes_tipo', label: 'Diabetes: tipo', type: 'select', options: ['Tipo 1', 'Tipo 2', 'Otro'] },
      { id: 'diabetes_evolucion', label: 'Diabetes: tiempo de evolución', type: 'text' },
      { id: 'diabetes_ulceras', label: 'Diabetes: úlceras', type: 'text' },
      { id: 'diabetes_complicaciones', label: 'Diabetes: complicaciones asociadas', type: 'text' },
      { id: 'diabetes_tratamiento', label: 'Diabetes: ¿recibe tratamiento?', type: 'bool' },
      { id: 'calzado_numero', label: 'N.º de calzado', type: 'text' },
      { id: 'calzado_tacos', label: 'Tacos (cm)', type: 'text' },
      { id: 'calzado_tipo', label: 'Tipo de calzado', type: 'text' },
      { id: 'desgaste_pd', label: 'Desgaste del pie derecho', type: 'text' },
      { id: 'desgaste_pi', label: 'Desgaste del pie izquierdo', type: 'text' },
      { id: 'plantillas', label: '¿Usa plantillas?', type: 'select', options: ['No', 'Sí'] },
      { id: 'calzado_caracteristicas', label: 'Características del calzado', type: 'text' },
      { id: 'temperatura_pd', label: 'Temperatura (pie derecho)', type: 'select', options: ['Normal', 'Caliente', 'Frío'] },
      { id: 'temperatura_pi', label: 'Temperatura (pie izquierdo)', type: 'select', options: ['Normal', 'Caliente', 'Frío'] },
      { id: 'humedad_pd', label: 'Humedad (pie derecho)', type: 'select', options: ['Normal', 'Bromhidrosis', 'Hiperhidrosis', 'Anhidrosis'] },
      { id: 'humedad_pi', label: 'Humedad (pie izquierdo)', type: 'select', options: ['Normal', 'Bromhidrosis', 'Hiperhidrosis', 'Anhidrosis'] },
      { id: 'pulso_pd', label: 'Pulso pedio (pie derecho)', type: 'select', options: ['Presente', 'Ausente', 'Disminuido'] },
      { id: 'pulso_pi', label: 'Pulso pedio (pie izquierdo)', type: 'select', options: ['Presente', 'Ausente', 'Disminuido'] },
      { id: 'coloracion_pd', label: 'Coloración (pie derecho)', type: 'select', options: ['Normal', 'Anormal'] },
      { id: 'coloracion_pi', label: 'Coloración (pie izquierdo)', type: 'select', options: ['Normal', 'Anormal'] },
      { id: 'textura_pd', label: 'Textura de la piel (pie derecho)', type: 'text' },
      { id: 'textura_pi', label: 'Textura de la piel (pie izquierdo)', type: 'text' },
      { id: 'edema_pd', label: 'Edema (pie derecho)', type: 'bool' },
      { id: 'edema_pi', label: 'Edema (pie izquierdo)', type: 'bool' },
      { id: 'inflamacion_pd', label: 'Inflamación (pie derecho)', type: 'bool' },
      { id: 'inflamacion_pi', label: 'Inflamación (pie izquierdo)', type: 'bool' },
      { id: 'pedigrafia', label: 'Pedigrafía N.º', type: 'text' },
      { id: 'forma_digital', label: 'Fórmula digital (forma de pie)', type: 'footshape' },
      { id: 'radiografias', label: 'Radiografías', type: 'bool' },
      { id: 'podoscopio', label: 'Observación en podoscopio', type: 'bool' },
      { id: 'dactilopatias', label: 'Dactilopatías', type: 'digits' },
      { id: 'onicopatias', label: 'Onicopatías', type: 'digits' },
      { id: 'helomas', label: 'Helomas', type: 'digits', zones: ['Plantar', 'Dorsal', 'Interdigital'] },
      { id: 'dermatopatias', label: 'Dermatopatías', type: 'digits', zones: ['Plantar', 'Dorsal', 'Interdigital', 'Pierna'] },
      { id: 'patologias_varias', label: 'Patologías varias', type: 'digits', zones: ['Plantar', 'Dorsal', 'Interdigital', 'Pierna'] },
      { id: 'mapa', label: 'Mapa de pies', type: 'footmap', hint: 'Tocá una zona para marcar un hallazgo' },
      { id: 'tratamiento_preventivo', label: 'Tratamiento preventivo', type: 'longtext' },
      { id: 'conclusion', label: 'Conclusión', type: 'longtext' },
      { id: 'sugerencias', label: 'Sugerencias al paciente', type: 'longtext' },
      { id: 'tratamiento_realizado', label: 'Tratamiento realizado', type: 'longtext' },
      { id: 'indicaciones', label: 'Indicaciones', type: 'longtext' },
      { id: 'control', label: 'Control (próxima visita)', type: 'text' },
    ],
  },
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
      { id: 'conclusion', label: 'Conclusión', type: 'longtext' },
      { id: 'sugerencias', label: 'Sugerencias al paciente', type: 'longtext' },
    ],
  },
  B: {
    code: 'B', name: 'Podología — evolución', version: 1, status: 'propuesta', followupDays: 45,
    fields: [
      { id: 'motivo', label: 'Motivo', type: 'text' },
      { id: 'mapa', label: 'Mapa de pies', type: 'footmap', hint: 'Tocá una zona para marcar un hallazgo' },
      { id: 'forma_digital', label: 'Fórmula digital (forma de pie)', type: 'footshape' },
      { id: 'hallazgos', label: 'Hallazgos', type: 'multi', options: ['Heloma', 'Hiperqueratosis', 'Onicolisis', 'Onicocriptosis (uña encarnada)', 'Micosis', 'Verrugas plantares', 'Fisuras', 'Deformidades'] },
      { id: 'procedimiento', label: 'Procedimiento realizado', type: 'longtext' },
      { id: 'indicaciones', label: 'Indicaciones', type: 'longtext' },
      { id: 'tratamiento_preventivo', label: 'Tratamiento preventivo', type: 'longtext' },
      { id: 'conclusion', label: 'Conclusión', type: 'longtext' },
      { id: 'sugerencias', label: 'Sugerencias al paciente', type: 'longtext' },
      { id: 'control', label: 'Control (próxima visita)', type: 'text' },
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
      { id: 'conclusion', label: 'Conclusión', type: 'longtext' },
      { id: 'sugerencias', label: 'Sugerencias al paciente', type: 'longtext' },
    ],
  },
}

/** Plantillas propuestas del prompt que todavía no están en la demo */
export const PROXIMAS = [
  'D · Depilación con cera', 'E · Facial', 'K · Microneedling / exosomas / PDRN', 'G · Corporal',
  'H · Despigmentante', 'I · Uñas soft gel', 'J · Cejas y pestañas',
]

export const FOOT_ZONES = {
  plantar: ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Metatarsos', 'Arco', 'Talón'],
  dorsal: ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Empeine', 'Tobillo'],
} as const

export const FOOT_FINDINGS = ['Heloma', 'Hiperqueratosis', 'Onicolisis', 'Uña encarnada', 'Micosis', 'Verruga plantar', 'Fisura', 'Deformidad', 'Dolor']

export type DigitsValue = Record<string, string>
export const DIGITS = [1, 2, 3, 4, 5] as const
export const SHAPES = ['griego', 'egipcio', 'romano'] as const
export const SHAPE_LABEL: Record<(typeof SHAPES)[number], string> = { griego: 'Griego', egipcio: 'Egipcio', romano: 'Romano (cuadrado)' }

/** Texto legible de un valor de la ficha (dedos por pie y forma de pie incluidos). */
export function formatDigits(v: unknown, zones: string[] = []): string {
  const o = (v ?? {}) as DigitsValue
  const parts: string[] = []
  for (const [side, tag] of [['pd', 'Der.'], ['pi', 'Izq.']] as const) {
    const d = DIGITS.filter((n) => o[side + n]).map((n) => n + '° ' + o[side + n])
    if (d.length) parts.push(tag + ': ' + d.join('; '))
  }
  for (const z of zones) if (o[z]) parts.push(z + ': ' + o[z])
  return parts.length ? parts.join(' · ') : '—'
}
export function formatShape(v: unknown): string {
  const o = (v ?? {}) as Record<string, string>
  const t = (k: string) => (o[k] ? SHAPE_LABEL[o[k] as keyof typeof SHAPE_LABEL] ?? o[k] : '')
  const parts = [t('pi') && 'Izq.: ' + t('pi').toLowerCase(), t('pd') && 'Der.: ' + t('pd').toLowerCase()].filter(Boolean)
  return parts.length ? parts.join(' · ') : '—'
}
