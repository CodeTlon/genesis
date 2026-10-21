'use client'
import { useRef } from 'react'

/** Botón que pide confirmación con un modal propio (nunca el confirm() del navegador). El botón de confirmar envía el formulario con `formAction`. */
export function ConfirmButton({ label, title, text, confirmLabel, formAction, className }: {
  label: string; title: string; text: string; confirmLabel: string; formAction: () => void | Promise<void>; className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={className}>{label}</button>
      <dialog ref={ref} className="g-modal" aria-labelledby="cm-title" onClick={(e) => { if (e.target === ref.current) ref.current?.close() }}>
        <h2 id="cm-title" className="text-xl font-semibold">{title}</h2>
        <p className="mt-2">{text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" autoFocus onClick={() => ref.current?.close()} className="min-h-touch rounded-control border border-tinta/60 px-5 hover:bg-lila/40">Cancelar</button>
          <button formAction={formAction} className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white hover:bg-tinta">{confirmLabel}</button>
        </div>
      </dialog>
    </>
  )
}
