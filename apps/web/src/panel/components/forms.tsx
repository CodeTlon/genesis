'use client'
import { useActionState } from 'react'
import { closeCase, openCase, saveAntecedentes, updatePatient, createPatient, type Res } from '@/panel/lib/actions'
import { ANTECEDENTE_ITEMS, EMPTY_DIABETES, type Antecedentes, type Case, type Patient } from '@/panel/lib/types'

const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4'
const primary = 'min-h-touch rounded-control bg-violeta-oscuro px-6 text-white transition-colors hover:bg-tinta disabled:opacity-60'

function Status({ state }: { state: Res | null }) {
  if (!state) return null
  return state.ok ? <p role="status" className="rounded-control bg-emerald-100 p-3 text-emerald-950">Guardado.</p> : <p role="alert" className="rounded-control bg-red-100 p-3 text-red-950">{state.message}</p>
}

const Field = ({ label, name, defaultValue, type = 'text', required, autoComplete, max }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean; autoComplete?: string; max?: number }) => (
  <label className="block">{label}{required ? '' : ' (opcional)'}
    <input name={name} type={type} defaultValue={defaultValue} required={required} autoComplete={autoComplete ?? 'off'} maxLength={max ?? 200} className={input} />
  </label>
)

export function PatientForm({ patient }: { patient?: Patient }) {
  const action = patient ? updatePatient.bind(null, patient.id) : createPatient
  const [state, formAction, pending] = useActionState<Res | null, FormData>(action, null)
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="firstName" defaultValue={patient?.firstName} required max={80} />
        <Field label="Apellido" name="lastName" defaultValue={patient?.lastName} required max={80} />
        <Field label="DNI" name="dni" defaultValue={patient?.dni} max={20} />
        <Field label="Fecha de nacimiento" name="birthDate" type="date" defaultValue={patient?.birthDate} />
        <Field label="Teléfono" name="phone" type="tel" defaultValue={patient?.phone} max={30} />
        <Field label="Domicilio" name="address" defaultValue={patient?.address} />
        <Field label="Ocupación" name="occupation" defaultValue={patient?.occupation} max={100} />
        <Field label="Obra social / prepaga" name="insurance" defaultValue={patient?.insurance} max={100} />
        <Field label="Contacto de emergencia" name="emergencyContact" defaultValue={patient?.emergencyContact} />
        <Field label="Responsable (si es menor de 18)" name="guardian" defaultValue={patient?.guardian} max={120} />
        <Field label="Fecha de primera consulta" name="firstVisit" type="date" defaultValue={patient?.firstVisit} />
        <Field label="Nacionalidad" name="nationality" defaultValue={patient?.nationality} max={60} />
        <label className="block">Sexo (opcional)
          <select name="sex" defaultValue={patient?.sex ?? ''} className={input}><option value="">Sin indicar</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select>
        </label>
        <Field label="Estatura en cm" name="heightCm" defaultValue={patient?.heightCm} max={6} />
        <Field label="Peso en kg" name="weightKg" defaultValue={patient?.weightKg} max={6} />
        <Field label="Grupo sanguíneo" name="bloodGroup" defaultValue={patient?.bloodGroup} max={5} />
        <Field label="Otras actividades" name="otherActivities" defaultValue={patient?.otherActivities} max={200} />
      </div>
      <Status state={state} />
      <button disabled={pending} className={primary}>{patient ? 'Guardar datos' : 'Crear paciente'}</button>
    </form>
  )
}

export function AntecedentesForm({ patientId, current }: { patientId: string; current: Antecedentes | null }) {
  const [state, formAction, pending] = useActionState<Res | null, FormData>(saveAntecedentes.bind(null, patientId), null)
  return (
    <form action={formAction} className="space-y-4">
      <fieldset>
        <legend className="font-semibold">Marcá lo que corresponda</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {ANTECEDENTE_ITEMS.map((it) => (
            <label key={it.id} className="flex min-h-touch cursor-pointer items-center gap-3 rounded-control border border-tinta/30 px-4 has-[:checked]:border-violeta-oscuro has-[:checked]:bg-lila/50">
              <input type="checkbox" name={`f_${it.id}`} defaultChecked={!!current?.flags[it.id]} className="size-5" />
              <span>{it.label}{it.alert && <span className="ml-1 text-xs text-tinta/70">(genera alerta)</span>}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="rounded-card border border-tinta/20 p-4">
        <legend className="px-2 font-semibold">Diabetes (completar si corresponde)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de diabetes" name="diab_tipo" defaultValue={(current?.diabetes ?? EMPTY_DIABETES).tipo} max={60} />
          <Field label="Tiempo de evolución" name="diab_evolucion" defaultValue={(current?.diabetes ?? EMPTY_DIABETES).evolucion} max={60} />
          <Field label="Úlceras previas" name="diab_ulceras" defaultValue={(current?.diabetes ?? EMPTY_DIABETES).ulceras} max={200} />
          <Field label="Complicaciones" name="diab_complicaciones" defaultValue={(current?.diabetes ?? EMPTY_DIABETES).complicaciones} max={300} />
          <Field label="Tratamiento de la diabetes" name="diab_tratamiento" defaultValue={(current?.diabetes ?? EMPTY_DIABETES).tratamiento} max={300} />
        </div>
      </fieldset>
      <Field label="Antecedentes familiares" name="familiares" defaultValue={current?.familiares} max={1000} />
      <label className="block">Medicación actual (opcional)<textarea name="medication" defaultValue={current?.medication} rows={2} maxLength={1000} className={`${input} py-3`} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Calzado habitual" name="footwear" defaultValue={current?.footwear} max={500} />
        <Field label="Actividad física / laboral" name="activity" defaultValue={current?.activity} max={500} />
      </div>
      <label className="block">Otros antecedentes y notas (opcional)<textarea name="notes" defaultValue={current?.notes} rows={3} maxLength={4000} className={`${input} py-3`} /></label>
      <Status state={state} />
      <button disabled={pending} className={primary}>Guardar antecedentes</button>
      {current && <p className="text-sm">Versión {current.version}, guardada el {new Date(current.createdAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}. Cada guardado crea una versión nueva.</p>}
    </form>
  )
}

export function OpenCaseForm({ patientId }: { patientId: string }) {
  const [state, formAction, pending] = useActionState<Res | null, FormData>(openCase.bind(null, patientId), null)
  return (
    <form action={formAction} className="space-y-3">
      <Field label="Título del caso (ej: uñero pie derecho)" name="title" required max={120} />
      <label className="block">Motivo de consulta (opcional)<textarea name="reason" rows={2} maxLength={2000} className={`${input} py-3`} /></label>
      <Status state={state} />
      <button disabled={pending} className={primary}>Abrir caso</button>
    </form>
  )
}

export function CloseCaseForm({ c }: { c: Case }) {
  const [state, formAction, pending] = useActionState<Res | null, FormData>(closeCase.bind(null, c.id), null)
  return (
    <form action={formAction} className="space-y-3">
      <label className="block">Conclusión<textarea name="conclusion" rows={3} required maxLength={4000} className={`${input} py-3`} /></label>
      <label className="block">Sugerencias para el paciente (opcional)<textarea name="suggestions" rows={3} maxLength={4000} className={`${input} py-3`} /></label>
      <Status state={state} />
      <button disabled={pending} className={primary}>Cerrar caso</button>
    </form>
  )
}
