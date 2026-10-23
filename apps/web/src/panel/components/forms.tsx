'use client'
import { useActionState, useEffect, useRef } from 'react'
import { useResultToast } from './toast'
import { closeCase, openCase, saveAntecedentes, updatePatient, createPatient, type Res } from '@/panel/lib/actions'
import { ANTECEDENTE_ITEMS, EMPTY_DIABETES, type Antecedentes, type Case, type Patient } from '@/panel/lib/types'

const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4 font-normal placeholder:text-tinta-suave'
const primary = 'min-h-touch w-full rounded-control bg-violeta-oscuro px-8 text-lg font-semibold text-white transition-colors hover:bg-tinta disabled:opacity-60 sm:w-auto'
const legend = 'text-lg font-semibold text-violeta-oscuro'
const choice = 'flex min-h-touch cursor-pointer items-center gap-3 rounded-control border border-tinta/50 bg-white px-4 has-[:checked]:border-violeta-oscuro has-[:checked]:bg-lila/50'

/** Éxito: toast breve. Error: aviso fijo que recibe el foco para que se lea de inmediato (el servidor devuelve un solo mensaje, no uno por campo). */
function Status({ state }: { state: Res | null }) {
  useResultToast(state && state.ok ? state : null)
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (state && !state.ok) ref.current?.focus() }, [state])
  if (!state || state.ok) return null
  return <p ref={ref} tabIndex={-1} role="alert" className="rounded-control bg-error-fondo p-3 font-semibold text-error-texto outline-offset-2">{state.message}</p>
}

function Submit({ pending, children, pendingText = 'Guardando...' }: { pending: boolean; children: React.ReactNode; pendingText?: string }) {
  return <button disabled={pending} className={primary}>{pending ? <><span className="g-spinner mr-2" aria-hidden />{pendingText}</> : children}</button>
}

const Optional = () => <span className="font-normal text-tinta-suave"> (opcional)</span>

type FieldProps = { label: string; name: string; defaultValue?: string; type?: string; required?: boolean; autoComplete?: string; max?: number; placeholder?: string; inputMode?: 'text' | 'decimal' | 'tel' | 'numeric' }
const Field = ({ label, name, defaultValue, type = 'text', required, autoComplete, max, placeholder, inputMode }: FieldProps) => (
  <label className="block font-semibold">{label}{!required && <Optional />}
    <input name={name} type={type} defaultValue={defaultValue} required={required} autoComplete={autoComplete ?? 'off'} maxLength={max ?? 200} placeholder={placeholder} inputMode={inputMode} className={input} />
  </label>
)

const Area = ({ label, name, defaultValue, rows = 2, max, placeholder, required }: { label: string; name: string; defaultValue?: string; rows?: number; max: number; placeholder?: string; required?: boolean }) => (
  <label className="block font-semibold">{label}{!required && <Optional />}
    <textarea name={name} defaultValue={defaultValue} rows={rows} maxLength={max} required={required} placeholder={placeholder} className={`${input} py-3`} />
  </label>
)

export function PatientForm({ patient }: { patient?: Patient }) {
  const action = patient ? updatePatient.bind(null, patient.id) : createPatient
  const [state, formAction, pending] = useActionState<Res | null, FormData>(action, null)
  return (
    <form action={formAction} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className={legend}>Quién es</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" name="firstName" defaultValue={patient?.firstName} required max={80} placeholder="Ej: María" autoComplete="off" />
          <Field label="Apellido" name="lastName" defaultValue={patient?.lastName} required max={80} placeholder="Ej: Gómez" />
          <Field label="DNI" name="dni" defaultValue={patient?.dni} max={20} placeholder="Ej: 30123456" inputMode="numeric" />
          <Field label="Fecha de nacimiento" name="birthDate" type="date" defaultValue={patient?.birthDate} />
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className={legend}>Cómo contactarlo</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" name="phone" type="tel" defaultValue={patient?.phone} max={30} placeholder="Ej: 351 555 1234" inputMode="tel" />
          <Field label="Domicilio" name="address" defaultValue={patient?.address} placeholder="Calle, número y localidad" />
          <Field label="Obra social / prepaga" name="insurance" defaultValue={patient?.insurance} max={100} placeholder="Ej: PAMI, OSDE, particular" />
          <Field label="Contacto de emergencia" name="emergencyContact" defaultValue={patient?.emergencyContact} placeholder="Nombre y teléfono. Ej: Ana (hija) 351 555 0000" />
          <Field label="Responsable (si es menor de 18)" name="guardian" defaultValue={patient?.guardian} max={120} placeholder="Nombre del padre, madre o tutor" />
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className={legend}>Datos de salud y hábitos</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha de primera consulta" name="firstVisit" type="date" defaultValue={patient?.firstVisit} />
          <Field label="Ocupación" name="occupation" defaultValue={patient?.occupation} max={100} placeholder="Ej: docente, jubilado" />
          <Field label="Nacionalidad" name="nationality" defaultValue={patient?.nationality} max={60} placeholder="Ej: Argentina" />
          <label className="block font-semibold">Sexo<Optional />
            <select name="sex" defaultValue={patient?.sex ?? ''} className={input}><option value="">Sin indicar</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select>
          </label>
          <Field label="Estatura en cm" name="heightCm" defaultValue={patient?.heightCm} max={6} placeholder="Ej: 165" inputMode="decimal" />
          <Field label="Peso en kg" name="weightKg" defaultValue={patient?.weightKg} max={6} placeholder="Ej: 70,5" inputMode="decimal" />
          <Field label="Grupo sanguíneo" name="bloodGroup" defaultValue={patient?.bloodGroup} max={5} placeholder="Ej: 0+, A-, AB+" />
          <Field label="Otras actividades" name="otherActivities" defaultValue={patient?.otherActivities} max={200} placeholder="Ej: caminatas, natación, baile" />
        </div>
      </fieldset>
      <Status state={state} />
      <Submit pending={pending}>{patient ? 'Guardar datos' : 'Crear paciente'}</Submit>
    </form>
  )
}

export function AntecedentesForm({ patientId, current }: { patientId: string; current: Antecedentes | null }) {
  const [state, formAction, pending] = useActionState<Res | null, FormData>(saveAntecedentes.bind(null, patientId), null)
  const d = current?.diabetes ?? EMPTY_DIABETES
  const group = (title: string, hint: string, items: typeof ANTECEDENTE_ITEMS) => (
    <fieldset>
      <legend className={legend}>{title}</legend>
      <p className="text-base text-tinta-suave">{hint}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <label key={it.id} className={choice}>
            <input type="checkbox" name={`f_${it.id}`} defaultChecked={!!current?.flags[it.id]} className="size-6 shrink-0" />
            <span>{it.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
  return (
    <form action={formAction} className="space-y-8">
      {group('Condiciones importantes', 'Si marcás alguna, aparece una alerta arriba de toda la ficha del paciente.', ANTECEDENTE_ITEMS.filter((i) => i.alert))}
      {group('Otros antecedentes', 'Marcá todo lo que corresponda.', ANTECEDENTE_ITEMS.filter((i) => !i.alert))}
      <fieldset className="space-y-4 rounded-card border border-tinta/20 p-4">
        <legend className={`${legend} px-2`}>Diabetes (solo si el paciente es diabético)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de diabetes" name="diab_tipo" defaultValue={d.tipo} max={60} placeholder="Ej: tipo 2" />
          <Field label="Tiempo de evolución" name="diab_evolucion" defaultValue={d.evolucion} max={60} placeholder="Ej: 8 años" />
          <Field label="Úlceras previas" name="diab_ulceras" defaultValue={d.ulceras} max={200} placeholder="Ej: ninguna, o dónde y cuándo" />
          <Field label="Complicaciones" name="diab_complicaciones" defaultValue={d.complicaciones} max={300} placeholder="Ej: neuropatía, problemas de vista" />
          <Field label="Tratamiento de la diabetes" name="diab_tratamiento" defaultValue={d.tratamiento} max={300} placeholder="Ej: metformina, insulina" />
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className={legend}>Más datos</legend>
        <Field label="Antecedentes familiares" name="familiares" defaultValue={current?.familiares} max={1000} placeholder="Ej: madre diabética, padre hipertenso" />
        <Area label="Medicación actual" name="medication" defaultValue={current?.medication} max={1000} placeholder="Ej: enalapril 10 mg por la mañana" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Calzado habitual" name="footwear" defaultValue={current?.footwear} max={500} placeholder="Ej: zapatillas, zapatos de trabajo" />
          <Field label="Actividad física / laboral" name="activity" defaultValue={current?.activity} max={500} placeholder="Ej: de pie 8 horas, camina mucho" />
        </div>
        <Area label="Otros antecedentes y notas" name="notes" defaultValue={current?.notes} rows={3} max={4000} placeholder="Cualquier dato que quieras recordar" />
      </fieldset>
      <Status state={state} />
      <Submit pending={pending}>Guardar antecedentes</Submit>
      {current && <p className="text-base text-tinta-suave">Versión {current.version}, guardada el {new Date(current.createdAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}. Cada guardado crea una versión nueva.</p>}
    </form>
  )
}

export function OpenCaseForm({ patientId }: { patientId: string }) {
  const [state, formAction, pending] = useActionState<Res | null, FormData>(openCase.bind(null, patientId), null)
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Título del caso" name="title" required max={120} placeholder="Ej: uñero pie derecho" />
      <Area label="Motivo de consulta" name="reason" max={2000} placeholder="Qué le molesta al paciente, desde cuándo y qué hizo hasta ahora" />
      <Status state={state} />
      <Submit pending={pending}>Abrir caso</Submit>
    </form>
  )
}

export function CloseCaseForm({ c }: { c: Case }) {
  const [state, formAction, pending] = useActionState<Res | null, FormData>(closeCase.bind(null, c.id), null)
  return (
    <form action={formAction} className="space-y-4">
      <Area label="Conclusión" name="conclusion" rows={3} required max={4000} placeholder="Cómo terminó el tratamiento y cómo quedó el paciente" />
      <Area label="Sugerencias para el paciente" name="suggestions" rows={3} max={4000} placeholder="Cuidados para hacer en casa, cuándo volver" />
      <Status state={state} />
      <Submit pending={pending}>Cerrar caso</Submit>
    </form>
  )
}
