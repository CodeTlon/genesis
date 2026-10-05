'use client'
import { useEffect, useState } from 'react'
import { IconHelp } from './icons'
import { usePathname, useRouter } from 'next/navigation'
import SpringCheck from '@genesis/ui/vendor/SpringCheck'
import StatusMark from '@genesis/ui/vendor/StatusMark'

const STEPS = [
  { href: '/hoy', task: 'Cambié el estado de un turno', title: 'Tu día de un vistazo', text: 'Acá ves los turnos de hoy, quién llegó y los avisos importantes (alergias, anticoagulantes, cumpleaños). Probá cambiar el estado de un turno con los botones.' },
  { href: '/resumen', task: 'Cambié entre profesionales', title: 'Resumen del equipo', text: 'Gráficos de las últimas 8 semanas: turnos atendidos, servicios más pedidos y días más cargados. Elegí una profesional arriba para ver solo lo suyo.' },
  { href: '/agenda', task: 'Moví un turno de horario', title: 'La agenda', text: 'Arrastrá un turno a otro horario o a la otra profesional. Si el horario está ocupado, te avisa y no lo mueve.' },
  { href: '/pacientes', task: 'Busqué a un paciente', title: 'Pacientes', text: 'Buscá por nombre o DNI (no importan los acentos). Entrá a una ficha para ver su historia, consentimientos y atenciones anteriores.' },
  { href: '/pacientes/p2/atencion?plantilla=B', task: 'Marqué una zona en el mapa de pies', title: 'Registrar una atención', text: 'Completá la plantilla, marcá hallazgos en el mapa de pies y firmá manteniendo apretado el botón. Al firmar se cierra el turno de hoy.' },
  { href: '/whatsapp', task: 'Respondí al recordatorio', title: 'WhatsApp (simulado)', text: 'Así se vería la confirmación de turnos por WhatsApp. Escribí como si fueras la paciente: es solo una simulación.' },
  { href: '/sitio', task: 'Miré las solicitudes de turno', title: 'El sitio web se edita desde acá', text: 'Textos, servicios, galería y las solicitudes de turno que llegan del sitio público.' },
] as const

const KEY = 'genesis-tour'
const DONE_KEY = 'genesis-tour-done'

export function Tour({ webUrl }: { webUrl?: string }) {
  const router = useRouter()
  const path = usePathname()
  const [checked, setChecked] = useState<number[]>([])
  const [step, setStep] = useState<number | null | undefined>(undefined) // undefined = todavía no sabemos (evita el parpadeo del botón)

  useEffect(() => {
    try {
      // Viene de la demo del sitio (?tour=1): se reinicia la guía desde el principio.
      if (new URLSearchParams(window.location.search).get('tour') === '1') {
        sessionStorage.setItem(KEY, '0'); sessionStorage.removeItem(DONE_KEY)
        window.history.replaceState(null, '', window.location.pathname)
      }
      const saved = sessionStorage.getItem(KEY)
      setStep(saved === null ? 0 : saved === 'off' ? null : Number(saved))
      setChecked(JSON.parse(sessionStorage.getItem(DONE_KEY) ?? '[]'))
    } catch { setStep(0) }
  }, [])

  const go = (n: number | null) => {
    setStep(n)
    try { sessionStorage.setItem(KEY, n === null ? 'off' : String(n)) } catch { /* sin storage: sigue funcionando */ }
    if (n !== null && n < STEPS.length) router.push(STEPS[n].href)
  }

  const toggle = (i: number, on: boolean) => {
    const next = on ? [...new Set([...checked, i])] : checked.filter((x) => x !== i)
    setChecked(next)
    try { sessionStorage.setItem(DONE_KEY, JSON.stringify(next)) } catch { /* sin storage: sigue funcionando */ }
  }

  if (step === undefined) return null
  if (step === null) {
    return (
      <button onClick={() => go(0)} className="print:hidden fixed bottom-20 right-3 z-40 flex size-12 items-center justify-center rounded-full bg-violeta-oscuro text-lg text-white md:bottom-4 md:right-4 md:w-auto md:px-5 shadow-soft hover:bg-tinta">
        <IconHelp className="size-6" /><span className="sr-only md:not-sr-only md:ml-2">Guía</span>
      </button>
    )
  }

  const done = step >= STEPS.length
  const s = STEPS[Math.min(step, STEPS.length - 1)]
  const onScreen = !done && path === s.href.split('?')[0]
  return (
    <aside role="dialog" aria-label="Guía de la demo" className="g-enter print:hidden fixed inset-x-3 bottom-20 z-40 mx-auto max-w-md rounded-card border border-lila bg-white p-5 shadow-soft md:inset-x-auto md:bottom-4 md:right-4">
      {done ? (
        <>
          <h2 className="text-lg font-semibold">¡Listo, ya recorriste la demo!</h2>
          <p className="mt-2">Podés seguir probando lo que quieras. Si querés empezar de cero, usá “Reiniciar demo” en el menú.</p>
          {webUrl && <a href={webUrl} className="mt-3 inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro hover:bg-lila/40">Volver al sitio público</a>}
        </>
      ) : (
        <>
          <p className="text-sm text-tinta/80" aria-live="polite">Paso {step + 1} de {STEPS.length}</p>
          <div aria-hidden className="mt-2 flex items-center gap-1.5">
            {STEPS.map((_, i) => <StatusMark key={i} size={22} status={checked.includes(i) || i < step ? 'done' : i === step ? 'running' : 'pending'} color="var(--color-violeta-oscuro)" doneColor="#047857" />)}
          </div>
          <h2 className="mt-3 text-lg font-semibold">{s.title}</h2>
          <p className="mt-2">{s.text}</p>
          <div className="mt-3 rounded-control bg-lila/30 px-3 py-2">
            <SpringCheck label={s.task} checked={checked.includes(step)} onChange={(v) => toggle(step, v)} color="var(--color-violeta-oscuro)" fillColor="var(--color-violeta-oscuro)" checkColor="#ffffff" fontSize={16} strike="left" />
          </div>
          {!onScreen && <button onClick={() => router.push(s.href)} className="mt-3 min-h-touch w-full rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro hover:bg-lila/40">Llevame a esta pantalla</button>}
        </>
      )}
      <div className="mt-4 flex gap-2">
        {step > 0 && !done && <button onClick={() => go(step - 1)} className="min-h-touch rounded-control border border-tinta/60 px-4 hover:bg-lila/40">Anterior</button>}
        <button onClick={() => go(done ? null : step + 1)} className="min-h-touch flex-1 rounded-control bg-violeta-oscuro px-4 text-white hover:bg-tinta">{done ? 'Cerrar' : step === STEPS.length - 1 ? 'Terminar' : 'Siguiente'}</button>
        {!done && <button onClick={() => go(null)} className="min-h-touch rounded-control px-3 hover:bg-lila/40">Saltar</button>}
      </div>
    </aside>
  )
}
