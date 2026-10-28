'use client'
import { createContext, useContext, useState } from 'react'

const Done = createContext<() => void>(() => {})
const Cancel = createContext<(() => void) | null>(null)
/** Los formularios llaman a esto al guardar bien, para volver a la vista de lectura. */
export const useEditDone = () => useContext(Done)
/** Cierra la edición sin guardar; es null cuando el formulario no está dentro de un Editable (por ejemplo, al crear). */
export const useEditCancel = () => useContext(Cancel)

/** Muestra el resumen de solo lectura y, con "Editar", el formulario completo. Evita tener formularios enormes siempre a la vista. */
export function Editable({ summary, editLabel = 'Editar', children }: { summary: React.ReactNode; editLabel?: string; children: React.ReactNode }) {
  const [editing, setEditing] = useState(false)
  if (!editing) {
    return (
      <div className="space-y-4">
        {summary}
        <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-touch items-center gap-2 rounded-control border border-violeta-oscuro px-5 font-semibold text-violeta-oscuro hover:bg-lila/40">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z" /></svg>
          {editLabel}
        </button>
      </div>
    )
  }
  return (
    <Done.Provider value={() => setEditing(false)}>
      <Cancel.Provider value={() => setEditing(false)}>
        <div className="g-enter space-y-4">{children}</div>
      </Cancel.Provider>
    </Done.Provider>
  )
}
