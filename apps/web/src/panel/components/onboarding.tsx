'use client'
import { useState } from 'react'
import Stepper, { Step } from '@genesis/ui/vendor/Stepper'

const STEPS = [
  ['Mirá lo que hay para hoy', 'En “Hoy” ves los turnos del día, los que faltan confirmar y los cumpleaños. Podés imprimir el día.'],
  ['Buscá a un paciente', 'En “Pacientes” escribí el nombre, el DNI o el teléfono. No importa si te olvidás una tilde.'],
  ['Registrá una atención', 'Dentro de la ficha elegí la plantilla. Si ya vino antes, se cargan los datos de la última visita y solo cambiás lo distinto.'],
  ['Marcá en el mapa de pies', 'Tocá la zona del pie, elegí el hallazgo y la gravedad. Queda guardado y se puede comparar entre visitas.'],
  ['Firmá y agendá el próximo turno', 'Mantené apretado el botón para firmar. Después, con un toque, agendás el próximo turno.'],
]

export function Onboarding() {
  const [done, setDone] = useState(false)
  if (done) return <p role="status" className="rounded-card bg-emerald-100 p-5 text-emerald-950">¡Listo! Ya sabés lo básico. Podés practicar con los pacientes de prueba.</p>
  return (
    <Stepper initialStep={1} onFinalStepCompleted={() => setDone(true)} backButtonText="Atrás" nextButtonText="Siguiente"
      stepCircleContainerClassName="!max-w-2xl !bg-white" contentClassName="text-tinta">
      {STEPS.map(([t, d]) => (
        <Step key={t}><h2 className="text-xl font-semibold">{t}</h2><p className="mt-2 text-lg">{d}</p></Step>
      ))}
    </Stepper>
  )
}
