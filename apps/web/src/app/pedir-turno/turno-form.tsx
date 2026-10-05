'use client'
import { useActionState } from 'react'
import { pedirTurno, type TurnoState } from './actions'

const field = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4 aria-[invalid=true]:border-red-700 aria-[invalid=true]:bg-red-50'

export function TurnoForm({ servicio, grupos }: { servicio?: string; grupos: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState<TurnoState, FormData>(pedirTurno, null)

  if (state?.ok) {
    return <p role="status" tabIndex={-1} ref={(el) => el?.focus()} className="g-enter rounded-card bg-lila/50 p-6 text-lg">{state.message}</p>
  }
  const err = state?.errors ?? {}

  return (
    <form action={action} noValidate className="space-y-6">
      <div>
        <label htmlFor="nombre" className="font-semibold">Nombre y apellido</label>
        <input id="nombre" name="nombre" placeholder="Ej: María Pérez" autoComplete="name" required aria-invalid={!!err.nombre} aria-describedby={err.nombre ? 'e-nombre' : undefined} className={field} />
        {err.nombre && <p id="e-nombre" className="mt-1 text-red-800">{err.nombre}</p>}
      </div>
      <div>
        <label htmlFor="telefono" className="font-semibold">Teléfono</label>
        <input id="telefono" name="telefono" placeholder="Ej: 351 123-4567" type="tel" inputMode="tel" autoComplete="tel" required aria-invalid={!!err.telefono} aria-describedby={err.telefono ? 'e-tel' : undefined} className={field} />
        {err.telefono && <p id="e-tel" className="mt-1 text-red-800">{err.telefono}</p>}
      </div>
      <div>
        <label htmlFor="servicio" className="font-semibold">¿Qué te interesa? (opcional)</label>
        <select id="servicio" name="servicio" defaultValue={servicio ?? ''} className={field}>
          <option value="">Todavía no lo sé</option>
          {grupos.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="mensaje" className="font-semibold">Mensaje (opcional)</label>
        <textarea id="mensaje" name="mensaje" rows={3} placeholder="Contanos qué tratamiento te interesa y en qué días o horarios te queda mejor" className={`${field} py-3`} />
        <p className="mt-1 text-base">Por favor no escribas datos de salud acá: los conversamos en la consulta.</p>
      </div>
      <input name="web" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="acepto" aria-invalid={!!err.acepto} aria-describedby={err.acepto ? 'e-acepto' : undefined} className="mt-1 size-6" />
          <span>Acepto que usen mi nombre y teléfono para contactarme (<a href="/privacidad" className="underline">ver privacidad</a>).</span>
        </label>
        {err.acepto && <p id="e-acepto" className="mt-1 text-red-800">{err.acepto}</p>}
      </div>
      {err.form && <p role="alert" className="text-red-800">{err.form}</p>}
      <button type="submit" disabled={pending} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-8 text-white hover:bg-tinta disabled:opacity-60">
        {pending ? 'Enviando…' : 'Pedir turno'}
      </button>
      <p className="text-base">Este pedido no es un turno confirmado: te contactamos para coordinar.</p>
    </form>
  )
}
