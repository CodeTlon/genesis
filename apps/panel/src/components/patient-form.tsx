'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { savePatientAction } from '@/lib/actions'
import type { Patient } from '@/lib/types'

const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/40 bg-white px-4'

/** Datos de la ficha de papel de Inés (REQ-PAC-005). Todo lo que no es nombre y apellido es opcional. */
export function PatientForm({ patient }: { patient?: Patient }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const v = (s?: string | number) => (s === undefined ? '' : String(s))

  function submit(f: FormData) {
    const g = (k: string) => String(f.get(k) ?? '')
    start(async () => {
      const r = await savePatientAction({
        id: patient?.id,
        firstName: g('firstName'), lastName: g('lastName'), dni: g('dni'), birthDate: g('birthDate'), phone: g('phone'), address: g('address'), insurance: g('insurance'),
        guardian: g('guardian'), firstVisit: g('firstVisit'), nationality: g('nationality'), sex: g('sex'),
        heightCm: g('heightCm') ? Number(g('heightCm')) : undefined, weightKg: g('weightKg') ? Number(g('weightKg')) : undefined,
        bloodGroup: g('bloodGroup'), occupation: g('occupation'), otherActivities: g('otherActivities'),
        emergency: g('emergencyName') ? { name: g('emergencyName'), phone: g('emergencyPhone') } : undefined,
        usesInsoles: patient?.usesInsoles, medication: patient?.medication,
      } as Parameters<typeof savePatientAction>[0])
      if (r.ok) router.push(`/pacientes/${r.id}`)
      else setError(r.message)
    })
  }

  const F = ({ name, label, type = 'text', def, required, hint }: { name: string; label: string; type?: string; def?: string | number; required?: boolean; hint?: string }) => (
    <label className="block">{label}{required ? ' *' : ''}
      <input name={name} type={type} defaultValue={v(def)} required={required} step={type === 'number' ? 'any' : undefined} className={input} />
      {hint && <span className="block text-sm text-tinta/70">{hint}</span>}
    </label>
  )

  return (
    <form action={submit} className="space-y-6">
      <fieldset className="grid gap-4 rounded-card bg-white p-5 shadow-soft sm:grid-cols-2">
        <legend className="px-2 text-lg font-semibold">Datos personales</legend>
        <F name="lastName" label="Apellido" def={patient?.lastName} required />
        <F name="firstName" label="Nombre" def={patient?.firstName} required />
        <F name="dni" label="DNI" def={patient?.dni} />
        <F name="birthDate" label="Fecha de nacimiento" type="date" def={patient?.birthDate} />
        <F name="nationality" label="Nacionalidad" def={patient?.nationality} />
        <label className="block">Sexo
          <select name="sex" defaultValue={v(patient?.sex)} className={input}><option value="">—</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select>
        </label>
        <F name="phone" label="Teléfono" type="tel" def={patient?.phone} />
        <F name="address" label="Domicilio" def={patient?.address} />
        <F name="insurance" label="Obra social" def={patient?.insurance} />
        <F name="firstVisit" label="Fecha de la primera consulta" type="date" def={patient?.firstVisit} />
        <F name="guardian" label="Responsable legal (obligatorio si es menor de 18)" def={patient?.guardian} />
      </fieldset>
      <fieldset className="grid gap-4 rounded-card bg-white p-5 shadow-soft sm:grid-cols-2">
        <legend className="px-2 text-lg font-semibold">Datos de salud y ocupación</legend>
        <F name="heightCm" label="Estatura (cm)" type="number" def={patient?.heightCm} />
        <F name="weightKg" label="Peso (kg)" type="number" def={patient?.weightKg} />
        <F name="bloodGroup" label="Grupo sanguíneo" def={patient?.bloodGroup} />
        <F name="occupation" label="Actividad laboral" def={patient?.occupation} />
        <F name="otherActivities" label="Otras actividades" def={patient?.otherActivities} />
      </fieldset>
      <fieldset className="grid gap-4 rounded-card bg-white p-5 shadow-soft sm:grid-cols-2">
        <legend className="px-2 text-lg font-semibold">Contacto de emergencia (opcional)</legend>
        <F name="emergencyName" label="Nombre" def={patient?.emergency?.name} />
        <F name="emergencyPhone" label="Teléfono" type="tel" def={patient?.emergency?.phone} />
      </fieldset>
      {error && <p role="alert" className="rounded-card bg-red-100 p-3 text-red-900">{error}</p>}
      <button disabled={pending} className="min-h-touch rounded-control bg-violeta-oscuro px-6 text-white">{pending ? 'Guardando…' : patient ? 'Guardar cambios' : 'Crear paciente'}</button>
    </form>
  )
}
