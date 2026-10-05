'use client'
import { useEffect, useRef, useState } from 'react'
import { whatsappRespond } from '@/lib/actions'
import { useToast } from './toast'

type Msg = { from: 'bot' | 'paciente' | 'sistema'; text: string }

const MENU = 'Hola 👋 Soy el asistente de Genesis. Respondé con un número:\n1) Pedir turno\n2) Confirmar o cambiar mi turno\n3) Horarios y cómo llegar\n4) Hablar con Inés'

const REMINDER: Msg = {
  from: 'bot',
  text: 'Recordatorio: mañana tenés turno en Genesis a las 10:00 (Colorado 5827), Carlos. Respondé:\n1) Confirmar\n2) Reprogramar\n3) Cancelar',
}

function reply(text: string, state: { step: string }): { msgs: Msg[]; alert?: string; step: string; effect?: 'confirm' | 'cancel' } {
  const t = text.trim().toLowerCase()
  if (text.startsWith('🎤'))
    return { msgs: [{ from: 'bot', text: 'Recibimos tu audio. Inés te contesta en breve.' }], alert: 'Audio recibido: derivado a una persona', step: 'menu' }
  if (['hola', 'menu', 'menú', 'buenas'].includes(t)) return { msgs: [{ from: 'bot', text: MENU }], step: 'menu' }
  if (state.step === 'turno') return { msgs: [{ from: 'bot', text: 'Anotamos tu pedido. Inés te confirma día y horario por acá. ¡Gracias!' }], alert: 'Pedido de turno nuevo para confirmar', step: 'menu' }
  if (state.step === 'confirm') {
    if (t === '1') return { msgs: [{ from: 'bot', text: '¡Listo! Tu turno quedó confirmado. Te esperamos.' }, { from: 'sistema', text: 'Agenda actualizada: el turno de Carlos Ferreyra (mañana 10:00) quedó Confirmado.' }], step: 'menu', effect: 'confirm' }
    if (t === '2') return { msgs: [{ from: 'bot', text: 'Ok, te vamos a ofrecer otro horario. Inés te escribe en breve.' }], alert: 'Pidió reprogramar su turno', step: 'menu' }
    if (t === '3') return { msgs: [{ from: 'bot', text: 'Turno cancelado. Cuando quieras, escribinos para pedir otro.' }, { from: 'sistema', text: 'Agenda actualizada: el turno de Carlos Ferreyra (mañana 10:00) quedó Cancelado.' }], step: 'menu', effect: 'cancel' }
  }
  if (t === '1') return { msgs: [{ from: 'bot', text: '¿Qué tratamiento te interesa? Escribilo con tus palabras (por ejemplo: "podología").' }], step: 'turno' }
  if (t === '2') return { msgs: [{ ...REMINDER }], step: 'confirm' }
  if (t === '3') return { msgs: [{ from: 'bot', text: 'Estamos en Colorado 5827, Córdoba. Los horarios los confirma Inés al dar el turno.' }], step: 'menu' }
  if (t === '4') return { msgs: [{ from: 'bot', text: 'Inés te contesta en breve.' }], alert: 'Pidió hablar con una persona', step: 'menu' }
  if (['hola', 'menu', 'menú', 'buenas'].includes(t)) return { msgs: [{ from: 'bot', text: MENU }], step: 'menu' }
  // Cualquier cosa que no entiende → humano. Nunca responde cuestiones clínicas.
  return { msgs: [{ from: 'bot', text: 'No entendí tu mensaje. Inés te contesta en breve.' }], alert: 'Mensaje que el bot no entendió: derivado', step: 'menu' }
}

export function WhatsAppSim() {
  const { toast } = useToast()
  const [msgs, setMsgs] = useState<Msg[]>([REMINDER])
  const [alerts, setAlerts] = useState<string[]>([])
  const [text, setText] = useState('')
  const [step, setStep] = useState('confirm')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [msgs])

  async function send(raw: string) {
    if (!raw.trim()) return
    const r = reply(raw, { step })
    if (r.effect) {
      await whatsappRespond(r.effect)
      toast({ title: r.effect === 'confirm' ? 'Turno confirmado por WhatsApp' : 'Turno cancelado por WhatsApp', description: 'La agenda ya lo refleja: mirá “Hoy”.' })
    }
    setMsgs((m) => [...m, { from: 'paciente', text: raw }, ...r.msgs])
    if (r.alert) setAlerts((a) => [r.alert!, ...a])
    setStep(r.step)
    setText('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <section aria-label="Conversación simulada" className="overflow-hidden rounded-card bg-white shadow-soft">
        <p className="bg-emerald-800 px-4 py-3 text-white">Genesis · Paciente de prueba (simulación)</p>
        <div className="h-96 space-y-2 overflow-y-auto bg-[#efe9f3] p-3" role="log" aria-live="polite">
          {msgs.map((m, i) => (
            <p key={i} className={`max-w-[85%] whitespace-pre-line rounded-card px-3 py-2 ${m.from === 'paciente' ? 'ml-auto bg-emerald-100' : m.from === 'sistema' ? 'mx-auto bg-lila/60 text-sm' : 'bg-white'}`}>{m.text}</p>
          ))}
          <div ref={end} />
        </div>
        <form className="flex gap-2 border-t border-lila/50 p-3" onSubmit={(e) => { e.preventDefault(); send(text) }}>
          <label className="sr-only" htmlFor="wa-text">Mensaje</label>
          <input id="wa-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribí 1, 2, 3, 4 u “hola”" className="min-h-touch min-w-0 flex-1 rounded-control border border-tinta/60 px-3" />
          <button className="min-h-touch rounded-control bg-violeta-oscuro px-4 text-white">Enviar</button>
        </form>
        <div className="flex flex-wrap gap-2 px-3 pb-3">
          <button onClick={() => send('🎤 Audio (0:12)')} className="min-h-touch rounded-control border border-violeta-oscuro px-3 text-violeta-oscuro">🎤 Mandar un audio</button>
          <button onClick={() => send('me duele mucho el pie, ¿qué tomo?')} className="min-h-touch rounded-control border border-violeta-oscuro px-3 text-violeta-oscuro">Consulta clínica</button>
          <button onClick={() => { setMsgs([REMINDER]); setStep('confirm'); setAlerts([]) }} className="min-h-touch rounded-control px-3 underline">Reiniciar</button>
        </div>
      </section>

      <section aria-label="Lo que ve Inés en el panel" className="space-y-4">
        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Alertas para Inés</h2>
          <ul className="mt-2 space-y-2">
            {alerts.map((a, i) => <li key={i} className="rounded-control bg-amber-100 p-3 text-amber-950">⚠ {a}</li>)}
            {!alerts.length && <li>Sin alertas. Probá mandar un audio o una consulta clínica.</li>}
          </ul>
        </div>
        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Qué hace y qué no hace el bot</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Recordatorio 24 h antes con botones y actualiza el estado del turno.</li>
            <li>Menú simple con números, pensado para personas mayores.</li>
            <li>Ante audios o mensajes que no entiende, avisa y deriva a una persona.</li>
            <li><strong>Nunca</strong> da diagnósticos ni consejos clínicos y no ve datos clínicos: solo fecha, hora y lugar.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
