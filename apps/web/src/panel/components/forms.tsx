'use client'
import Link from 'next/link'
import { useActionState, useEffect, useRef } from 'react'
import { useResultToast } from './toast'
import { useEditCancel, useEditDone } from './editable'
import { closeCase, openCase, saveAntecedentes, updatePatient, createPatient, type Res } from '@/panel/lib/actions'
import { ANTECEDENTE_ITEMS, EMPTY_DIABETES, type Antecedentes, type Case, type Patient } from '@/panel/lib/types'

const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4 font-normal placeholder:text-tinta-suave'
const primary = 'min-h-touch w-full rounded-control bg-violeta-oscuro px-8 text-lg font-semibold text-white transition-colors hover:bg-tinta disabled:opacity-60 sm:w-auto'
const secondary = 'min-h-touch rounded-control border border-tinta/50 bg-white px-6 font-semibold transition-colors hover:bg-lila/40'
const legend = 'text-lg font-semibold text-violeta-oscuro'
const choice = 'flex min-h-touch cursor-pointer items-center gap-3 rounded-control border border-tinta/50 bg-white px-4 has-[:checked]:border-violeta-oscuro has-[:checked]:bg-lila/50'

/** Éxito: toast breve. Error: aviso fijo que recibe el foco para que se lea de inmediato (el servidor devuelve un solo mensaje, no uno por campo). */
function Status({ state }: { state: Res | null }) {
  useResultToast(state && state.ok ? state : null)
  const done = useEditDone()
  useEffect(() => { if (state?.ok) done() }, [state, done])
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (state && !state.ok) ref.current?.focus() }, [state])
  if (!state || state.ok) return null
  return <p ref={ref} tabIndex={-1} role="alert" className="rounded-control bg-error-fondo p-3 font-semibold text-error-texto outline-offset-2">{state.message}</p>
}

/** Botón "Cancelar" de los formularios: cierra la edición si está dentro de un Editable; si no, lleva a `href` (por ejemplo al crear). */
function Cancel({ href }: { href?: string }) {
  const cancel = useEditCancel()
  if (cancel) return <button type="button" onClick={cancel} className={`${secondary} w-full sm:w-auto`}>Cancelar</button>
  if (href) return <Link href={href} className={`${secondary} inline-flex w-full items-center justify-center sm:w-auto`}>Cancelar</Link>
  return null
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>
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

/** Sección plegable: lo esencial queda a la vista y el resto se abre cuando hace falta. Los campos de una sección cerrada igual se envían con el formulario. */
function Section({ title, hint, open, badge, children }: { title: string; hint?: string; open?: boolean; badge?: string; children: React.ReactNode }) {
  return (
    <details open={open} className="g-acc rounded-card border border-lila/70 bg-white">
      <summary className="flex min-h-touch items-center justify-between gap-3 px-4 py-2">
        <span className="min-w-0"><span className={`${legend} block`}>{title}</span>{hint && <span className="block text-base font-normal text-tinta-suave">{hint}</span>}</span>
        <span className="flex shrink-0 items-center gap-2">
          {badge && <span className="rounded-full bg-lila/50 px-2.5 py-0.5 text-base font-semibold text-violeta-oscuro">{badge}</span>}
          <svg aria-hidden viewBox="0 0 24 24" className="g-chev size-6 text-violeta-oscuro" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </summary>
      <div className="space-y-4 px-4 pb-4 pt-2">{children}</div>
    </details>
  )
}
const filled = (...v: (string | undefined)[]) => v.filter((x) => x && x.trim()).length
const count = (n: number) => (n ? `${n} cargado${n === 1 ? '' : 's'}` : undefined)

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
          <Field label="Teléfono" name="phone" type="tel" defaultValue={patient?.phone} max={30} placeholder="Ej: 351 555 1234" inputMode="tel" />
          <Field label="Responsable (si es menor de 18)" name="guardian" defaultValue={patient?.guardian} max={120} placeholder="Nombre del padre, madre o tutor" />
        </div>
      </fieldset>
      <Section title="Contacto y cobertura" hint="Domicilio, obra social y contacto de emergencia" open={filled(patient?.address, patient?.insurance, patient?.emergencyContact) > 0} badge={count(filled(patient?.address, patient?.insurance, patient?.emergencyContact))}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Domicilio" name="address" defaultValue={patient?.address} placeholder="Calle, número y localidad" />
          <Field label="Obra social / prepaga" name="insurance" defaultValue={patient?.insurance} max={100} placeholder="Ej: PAMI, OSDE, particular" />
          <Field label="Contacto de emergencia" name="emergencyContact" defaultValue={patient?.emergencyContact} placeholder="Nombre y teléfono. Ej: Ana (hija) 351 555 0000" />
        </div>
      </Section>
      <Section title="Salud y hábitos" hint="Primera consulta, medidas y actividades" open={filled(patient?.firstVisit, patient?.occupation, patient?.nationality, patient?.sex, patient?.heightCm, patient?.weightKg, patient?.bloodGroup, patient?.otherActivities) > 0} badge={count(filled(patient?.firstVisit, patient?.occupation, patient?.nationality, patient?.sex, patient?.heightCm, patient?.weightKg, patient?.bloodGroup, patient?.otherActivities))}>
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
      </Section>
      <Status state={state} />
      <Actions><Submit pending={pending}>{patient ? 'Guardar datos' : 'Crear paciente'}</Submit><Cancel href={patient ? undefined : '/panel/pacientes'} /></Actions>
    </form>
  )
}

export function AntecedentesForm({ patientId, current }: { patientId: string; current: Antecedentes | null }) {
  const [state, formAction, pending] = useActionState<Res | null, FormData>(saveAntecedentes.bind(null, patientId), null)
  const d = current?.diabetes ?? EMPTY_DIABETES
  const others = ANTECEDENTE_ITEMS.filter((i) => !i.alert && current?.flags[i.id]).length
  const diabFilled = filled(d.tipo, d.evolucion, d.ulceras, d.complicaciones, d.tratamiento)
  const moreFilled = filled(current?.familiares, current?.medication, current?.footwear, current?.activity, current?.notes)
  const group = (title: string | null, hint: string | null, items: typeof ANTECEDENTE_ITEMS) => (
    <fieldset>
      {title && <legend className={legend}>{title}</legend>}
      {hint && <p className="text-base text-tinta-suave">{hint}</p>}
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
      <Section title="Otros antecedentes" hint="Marcá todo lo que corresponda" open={others > 0} badge={others ? `${others} marcado${others === 1 ? '' : 's'}` : undefined}>
        {group(null, null, ANTECEDENTE_ITEMS.filter((i) => !i.alert))}
      </Section>
      <Section title="Datos de diabetes" hint="Solo si el paciente es diabético" open={!!current?.flags.diabetes || diabFilled > 0} badge={count(diabFilled)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de diabetes" name="diab_tipo" defaultValue={d.tipo} max={60} placeholder="Ej: tipo 2" />
          <Field label="Tiempo de evolución" name="diab_evolucion" defaultValue={d.evolucion} max={60} placeholder="Ej: 8 años" />
          <Field label="Úlceras previas" name="diab_ulceras" defaultValue={d.ulceras} max={200} placeholder="Ej: ninguna, o dónde y cuándo" />
          <Field label="Complicaciones" name="diab_complicaciones" defaultValue={d.complicaciones} max={300} placeholder="Ej: neuropatía, problemas de vista" />
          <Field label="Tratamiento de la diabetes" name="diab_tratamiento" defaultValue={d.tratamiento} max={300} placeholder="Ej: metformina, insulina" />
        </div>
      </Section>
      <Section title="Más datos" hint="Familiares, medicación, calzado y notas" open={moreFilled > 0} badge={count(moreFilled)}>
        <Field label="Antecedentes familiares" name="familiares" defaultValue={current?.familiares} max={1000} placeholder="Ej: madre diabética, padre hipertenso" />
        <Area label="Medicación actual" name="medication" defaultValue={current?.medication} max={1000} placeholder="Ej: enalapril 10 mg por la mañana" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Calzado habitual" name="footwear" defaultValue={current?.footwear} max={500} placeholder="Ej: zapatillas, zapatos de trabajo" />
          <Field label="Actividad física / laboral" name="activity" defaultValue={current?.activity} max={500} placeholder="Ej: de pie 8 horas, camina mucho" />
        </div>
        <Area label="Otros antecedentes y notas" name="notes" defaultValue={current?.notes} rows={3} max={4000} placeholder="Cualquier dato que quieras recordar" />
      </Section>
      <Status state={state} />
      <Actions><Submit pending={pending}>Guardar antecedentes</Submit><Cancel /></Actions>
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
