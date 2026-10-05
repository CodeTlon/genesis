'use client'
import { useTransition } from 'react'
import { changeStatus } from '@/lib/actions'
import { STATUS_LABEL, type ApptStatus } from '@/lib/types'
import { useToast } from './toast'

const NEXT: Partial<Record<ApptStatus, { to: ApptStatus; label: string }[]>> = {
  pending: [{ to: 'confirmed', label: 'Confirmar' }, { to: 'cancelled', label: 'Cancelar' }],
  confirmed: [{ to: 'in_room', label: 'En sala' }, { to: 'no_show', label: 'Ausente' }, { to: 'cancelled', label: 'Cancelar' }],
  in_room: [{ to: 'done', label: 'Atendido' }],
}

export function StatusBadge({ status }: { status: ApptStatus }) {
  const tone: Record<ApptStatus, string> = {
    pending: 'bg-amber-100 text-amber-950', confirmed: 'bg-emerald-100 text-emerald-950', in_room: 'bg-sky-100 text-sky-950',
    done: 'bg-lila/50 text-tinta', no_show: 'bg-red-100 text-red-950', cancelled: 'bg-neutral-200 text-tinta',
  }
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm ${tone[status]}`}>{STATUS_LABEL[status]}</span>
}

export function StatusActions({ id, status }: { id: string; status: ApptStatus }) {
  const [pending, start] = useTransition()
  const { toast } = useToast()
  const acts = NEXT[status] ?? []
  if (!acts.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {acts.map((a) => (
        <button key={a.to} disabled={pending} onClick={() => start(async () => {
            const ok = await changeStatus(id, a.to)
            if (!ok) return toast({ title: 'No se pudo cambiar el estado', error: true })
            toast({
              title: `Turno: ${STATUS_LABEL[a.to].toLowerCase()}`,
              ...(a.to !== 'done' ? { actionLabel: 'Deshacer', onAction: () => { void changeStatus(id, status) } } : {}),
            })
          })}
          className="min-h-touch rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro hover:bg-lila/40 disabled:opacity-60">
          {a.label}
        </button>
      ))}
    </div>
  )
}
