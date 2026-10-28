// Carga datos FICTICIOS para probar las pantallas con distintos volúmenes y tipos de paciente.
// Uso:  SEMBRAR_DATOS_FICTICIOS=si DATABASE_URL=... CLINICAL_DATA_ENCRYPTION_KEY=... CANTIDAD=250 npx tsx scripts/sembrar-prueba.ts
// Pasa por las mismas funciones de repo.ts que usa la app (mismo cifrado y mismos controles). Nunca usar con pacientes reales.
import { db, schema } from '@genesis/db/client'
import * as repo from '../apps/web/src/panel/lib/repo'
import { ANTECEDENTE_ITEMS, EMPTY_DIABETES, type FootMarker, type FootType } from '../apps/web/src/panel/lib/types'

if (process.env.SEMBRAR_DATOS_FICTICIOS !== 'si') throw new Error('Esto carga datos ficticios. Si es lo que querés, definí SEMBRAR_DATOS_FICTICIOS=si.')
if (process.env.NODE_ENV === 'production') throw new Error('No se siembra en producción.')

// Generador determinista: la misma semilla produce siempre los mismos pacientes.
let seed = 20261028
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
const chance = (p: number) => rnd() < p
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))

const NOMBRES = ['María', 'José', 'Ana', 'Juan', 'Lucía', 'Carlos', 'Marta', 'Roberto', 'Elena', 'Jorge', 'Laura', 'Héctor', 'Silvia', 'Raúl', 'Graciela', 'Óscar', 'Nélida', 'Ramón', 'Teresa', 'Aníbal', 'Rosa', 'Ñusta', 'Inés', 'Mónica', 'Pedro']
const APELLIDOS = ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Sánchez', 'Romero', 'Suárez', 'Ríos', 'Paz', 'Acosta', 'Ibáñez', "D'Angelo", 'Peña', 'Núñez', 'Vázquez', 'Ledesma', 'Bustos', 'Cabrera', 'Ferreyra', 'Moyano', 'Funes']
const OCUPACIONES = ['docente', 'jubilado', 'ama de casa', 'comerciante', 'enfermera', 'albañil', 'empleado administrativo', 'cocinera', 'chofer']
const OBRAS = ['PAMI', 'OSDE', 'Swiss Medical', 'APROSS', 'particular', 'Galeno']
const CALLES = ['Av. Colón', 'San Martín', 'Bv. Illia', 'Obispo Trejo', 'Av. Vélez Sarsfield', 'Rivadavia', 'Deán Funes']
const MOTIVOS = ['Control de rutina', 'Dolor en el dedo gordo', 'Callo en el talón', 'Uña encarnada', 'Hongos en las uñas', 'Verruga plantar', 'Fisuras en los talones', 'Control de pie diabético']
const FINDINGS = ['Callo', 'Dureza', 'Heloma', 'Hiperqueratosis', 'Onicolisis', 'Uña encarnada', 'Micosis', 'Verruga plantar', 'Fisura', 'Deformidad', 'Dolor']
const HALLAZGOS = ['Heloma', 'Hiperqueratosis', 'Onicolisis', 'Onicocriptosis (uña encarnada)', 'Micosis', 'Verrugas plantares', 'Fisuras', 'Deformidades']
const ZONAS_PLANTA = ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Metatarsos', 'Arco', 'Talón']
const ZONAS_DORSO = ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Empeine', 'Tobillo']
const LARGO = 'Paciente refiere dolor al apoyar que empeora hacia la tarde, con sensación de ardor y hormigueo en la planta; usa calzado cerrado muchas horas por su trabajo y no recuerda traumatismos previos. '

const dniN = () => String(int(9_000_000, 48_000_000))
const fecha = (yMin: number, yMax: number) => `${int(yMin, yMax)}-${String(int(1, 12)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`

const markers = (n: number): FootMarker[] => Array.from({ length: n }, () => {
  const view = pick(['plantar', 'dorsal'] as const)
  return { side: pick(['left', 'right'] as const), view, zone: pick(view === 'plantar' ? ZONAS_PLANTA : ZONAS_DORSO), finding: pick(FINDINGS), severity: pick([1, 2, 3] as const), state: pick(['a_tratar', 'tratado'] as const), note: chance(0.3) ? 'Duele al apoyar' : undefined }
}).filter((m, i, a) => a.findIndex((x) => x.side === m.side && x.view === m.view && x.zone === m.zone) === i)

const payload = (heavy: boolean) => ({
  motivo: pick(MOTIVOS),
  footType: pick(['egipcio', 'griego', 'romano'] as FootType[]),
  markers: markers(heavy ? 12 : int(0, 4)),
  hallazgos: Array.from(new Set(Array.from({ length: int(0, 3) }, () => pick(HALLAZGOS)))),
  procedimiento: heavy ? LARGO.repeat(6) : chance(0.7) ? 'Quiropodia y fresado de uña.' : '',
  indicaciones: chance(0.6) ? 'Crema hidratante dos veces al día, calzado amplio.' : '',
  tratamiento_preventivo: chance(0.3) ? 'Plantillas y controles cada 60 días.' : '',
  control: chance(0.5) ? 'En 45 días' : '',
})

async function main() {
  const total = Number(process.env.CANTIDAD) || 250
  const [user] = await db().select({ id: schema.user.id }).from(schema.user).limit(1)
  if (!user) throw new Error('Primero creá un usuario (scripts/crear-usuario.mjs).')
  const uid = user.id
  const stats = { pacientes: 0, casos: 0, evoluciones: 0, borradores: 0 }

  async function caso(patientId: string, evos: number, opts: { heavy?: boolean; cerrar?: boolean; borrador?: boolean } = {}) {
    const id = await repo.openCase(patientId, pick(MOTIVOS), opts.heavy ? LARGO.repeat(3) : pick(MOTIVOS), uid)
    if (!id) return
    stats.casos++
    for (let i = 0; i < evos; i++) {
      const sign = !(opts.borrador && i === evos - 1)
      const r = await repo.saveEntry({ patientId, caseId: id, payload: payload(!!opts.heavy), sign, userId: uid })
      if (r.ok) { stats.evoluciones++; if (!sign) stats.borradores++ }
    }
    if (opts.cerrar) await repo.closeCase(id, 'Evolución favorable, el paciente quedó sin molestias.', 'Seguir con la higiene diaria y volver ante cualquier cambio.')
  }

  async function antecedentes(patientId: string, modo: 'pocos' | 'todos' | 'diabetes') {
    const flags: Record<string, boolean> = {}
    for (const it of ANTECEDENTE_ITEMS) flags[it.id] = modo === 'todos' ? true : modo === 'diabetes' ? it.id === 'diabetes' || it.id === 'hipertension' || chance(0.1) : chance(0.12)
    await repo.saveAntecedentes(patientId, {
      flags, notes: modo === 'todos' ? LARGO.repeat(4) : '', medication: modo === 'pocos' ? '' : 'Enalapril 10 mg por la mañana, metformina 850 mg.', footwear: chance(0.5) ? 'Zapatillas' : '', activity: chance(0.5) ? 'De pie 8 horas' : '', familiares: chance(0.4) ? 'Madre diabética' : '',
      diabetes: modo === 'diabetes' || modo === 'todos' ? { tipo: 'Tipo 2', evolucion: '12 años', ulceras: 'Úlcera previa en 2019', complicaciones: 'Neuropatía periférica', tratamiento: 'Metformina e insulina' } : EMPTY_DIABETES,
    }, uid)
  }

  const base = (first: string, last: string) => ({ firstName: first, lastName: last, dni: '', birthDate: '', phone: '', address: '', occupation: '', insurance: '', emergencyContact: '', guardian: '', firstVisit: '', nationality: '', sex: '', heightCm: '', weightKg: '', bloodGroup: '', otherActivities: '' })

  for (let n = 0; n < total; n++) {
    const first = pick(NOMBRES), last = pick(APELLIDOS)
    const t = rnd()
    if (t < 0.34) { // mínimo: solo nombre y apellido
      await repo.createPatient(base(first, last), uid)
    } else if (t < 0.68) { // estándar
      const id = await repo.createPatient({ ...base(first, last), dni: dniN(), phone: `351 ${int(400, 699)} ${int(1000, 9999)}`, birthDate: fecha(1940, 1985), sex: pick(['Femenino', 'Masculino', '']), insurance: pick(OBRAS) }, uid)
      if (chance(0.6)) await antecedentes(id, 'pocos')
      await caso(id, int(1, 3), { borrador: chance(0.15) })
      stats.pacientes++; continue
    } else if (t < 0.84) { // completo
      const id = await repo.createPatient({
        firstName: first, lastName: last, dni: dniN(), birthDate: fecha(1935, 1975), phone: `351 ${int(400, 699)} ${int(1000, 9999)}`, address: `${pick(CALLES)} ${int(100, 4999)}, Córdoba`, occupation: pick(OCUPACIONES), insurance: pick(OBRAS),
        emergencyContact: `${pick(NOMBRES)} (hija) 351 555 ${int(1000, 9999)}`, guardian: '', firstVisit: fecha(2023, 2026), nationality: 'Argentina', sex: pick(['Femenino', 'Masculino']), heightCm: String(int(150, 185)), weightKg: String(int(55, 100)), bloodGroup: pick(['0+', 'A+', 'B-', 'AB+']), otherActivities: 'Caminatas, natación',
      }, uid)
      await antecedentes(id, chance(0.5) ? 'diabetes' : 'pocos')
      for (let c = 0; c < int(2, 4); c++) await caso(id, int(2, 6), { cerrar: c > 0, borrador: c === 0 && chance(0.3) })
      stats.pacientes++; continue
    } else if (t < 0.92) { // menor con responsable
      const id = await repo.createPatient({ ...base(first, last), birthDate: fecha(2008, 2018), guardian: `${pick(NOMBRES)} ${last} (madre)`, phone: `351 ${int(400, 699)} ${int(1000, 9999)}` }, uid)
      await caso(id, int(1, 2))
      stats.pacientes++; continue
    } else { // sin ficha clínica todavía (solo alta)
      await repo.createPatient({ ...base(first, last), dni: dniN(), phone: `351 ${int(400, 699)} ${int(1000, 9999)}` }, uid)
    }
    stats.pacientes++
  }

  // Casos extremos: nombres larguísimos, los 18 antecedentes, un caso con 40 evoluciones largas y muchas marcas.
  const largo = await repo.createPatient({
    ...base('María de los Ángeles del Valle', 'Fernández de la Vega Rodríguez-Pereyra'), dni: '10123456', birthDate: '1948-02-29', phone: '351 555 0000', address: 'Av. Hipólito Yrigoyen 1234, Piso 7 Depto. B, Barrio Nueva Córdoba, Córdoba Capital',
    occupation: 'Jubilada, ex directora de escuela primaria y presidenta de la cooperadora', insurance: 'PAMI - Programa de Atención Médica Integral', emergencyContact: 'Hija: Ana Paula Fernández 351 555 1111 / Hijo: Martín 351 555 2222', otherActivities: 'Caminatas, natación, baile folklórico, yoga', nationality: 'Argentina', sex: 'Femenino', heightCm: '158', weightKg: '72', bloodGroup: 'AB+',
  }, uid)
  await antecedentes(largo, 'todos')
  await caso(largo, 40, { heavy: true, borrador: true })
  for (let c = 0; c < 8; c++) await caso(largo, 2, { cerrar: true })
  stats.pacientes++

  console.log('Datos ficticios cargados:', stats)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
