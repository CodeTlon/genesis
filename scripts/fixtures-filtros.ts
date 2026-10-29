// Datos FICTICIOS con forma conocida para probar los filtros: todo lleva la etiqueta TAG en el nombre o el título del caso.
// Uso (solo pruebas):  FIXTURES_TAG=abc SEMBRAR_DATOS_FICTICIOS=si DATABASE_URL=... CLINICAL_DATA_ENCRYPTION_KEY=... npx tsx scripts/fixtures-filtros.ts
import { sql } from 'drizzle-orm'
import { db, schema } from '@genesis/db/client'
import * as repo from '../apps/web/src/panel/lib/repo'
import { EMPTY_DIABETES } from '../apps/web/src/panel/lib/types'

if (process.env.SEMBRAR_DATOS_FICTICIOS !== 'si') throw new Error('Esto carga datos ficticios. Definí SEMBRAR_DATOS_FICTICIOS=si.')
if (process.env.NODE_ENV === 'production') throw new Error('No se siembra en producción.')
const TAG = process.env.FIXTURES_TAG
if (!TAG || !/^[a-z0-9]{3,20}$/.test(TAG)) throw new Error('Definí FIXTURES_TAG (letras y números, 3 a 20).')

const base = (first: string, last: string) => ({ firstName: first, lastName: `${last} ${TAG}`, dni: '', birthDate: '', phone: '', address: '', occupation: '', insurance: '', emergencyContact: '', guardian: '', firstVisit: '', nationality: '', sex: '', heightCm: '', weightKg: '', bloodGroup: '', otherActivities: '' })
const DAY = 864e5

async function main() {
  const [user] = await db().select({ id: schema.user.id }).from(schema.user).limit(1)
  if (!user) throw new Error('Primero creá un usuario.')
  const uid = user.id
  const alerts = (flags: string[]) => ({ flags: Object.fromEntries(flags.map((f) => [f, true])), notes: '', medication: '', footwear: '', activity: '', familiares: '', diabetes: EMPTY_DIABETES })
  const payload = { motivo: 'Control' }
  // Las evoluciones firmadas no se pueden modificar (trigger de la base): para fechar una en el pasado se apaga el trigger un instante, solo en estos datos de prueba.
  const backdate = async (entryId: string, when: Date) => {
    await db().execute(sql`alter table clinical_entries disable trigger clinical_entries_immutable`)
    try {
      await db().execute(sql`update clinical_entries set created_at = ${when.toISOString()}, signed_at = case when status = 'signed' then ${when.toISOString()}::timestamptz else null end where id = ${entryId}`)
    } finally {
      await db().execute(sql`alter table clinical_entries enable trigger clinical_entries_immutable`)
    }
  }
  async function entry(patientId: string, caseId: string, sign: boolean, when?: Date) {
    const r = await repo.saveEntry({ patientId, caseId, payload, sign, userId: uid })
    if (!r.ok) throw new Error(r.message)
    if (when) await backdate(r.entry.id, when)
  }

  // 1. Sana: sin alertas ni casos
  await repo.createPatient(base('Ana', 'Sana'), uid)

  // 2. Diabética: alerta diabetes, un caso abierto con una atención firmada hoy
  const p2 = await repo.createPatient(base('Beatriz', 'Diabetica'), uid)
  await repo.saveAntecedentes(p2, alerts(['diabetes']), uid)
  const c2 = (await repo.openCase(p2, `Caso-D ${TAG}`, 'Control', uid))!
  await entry(p2, c2, true)

  // 3. Menor: con responsable, sin casos
  await repo.createPatient({ ...base('Carla', 'Menor'), birthDate: '2015-04-10', guardian: 'Madre de Carla' }, uid)

  // 4. Anticoagulada: dos alertas, caso CERRADO con una atención firmada el mes pasado
  const p4 = await repo.createPatient(base('Diana', 'Anticoag'), uid)
  await repo.saveAntecedentes(p4, alerts(['anticoagulantes', 'antiagregados']), uid)
  const c4 = (await repo.openCase(p4, `Caso-A ${TAG}`, 'Control', uid))!
  await entry(p4, c4, true, new Date(repo.startOfMonth(new Date(), 1).getTime() + 14 * DAY))
  await repo.closeCase(c4, 'Resuelto', 'Controles')

  // 5. Con borrador: caso abierto con un borrador de hoy y una firmada hace 100 días
  const p5 = await repo.createPatient(base('Elena', 'Borrador'), uid)
  const c5 = (await repo.openCase(p5, `Caso-B ${TAG}`, 'Control', uid))!
  await entry(p5, c5, true, new Date(Date.now() - 100 * DAY))
  await entry(p5, c5, false)

  // 6. Dos casos abiertos (AAA y BBB, en ese orden), alerta de alergia
  const p6 = await repo.createPatient(base('Flavia', 'Dos'), uid)
  await repo.saveAntecedentes(p6, alerts(['alergias']), uid)
  const c6a = (await repo.openCase(p6, `Caso-AAA ${TAG}`, 'Control', uid))!
  await entry(p6, c6a, true)
  const c6b = (await repo.openCase(p6, `Caso-BBB ${TAG}`, 'Control', uid))!
  await entry(p6, c6b, true)

  console.log('fixtures listos', TAG)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
