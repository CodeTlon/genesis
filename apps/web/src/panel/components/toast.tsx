'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type Kind = 'ok' | 'error'
type Toast = { id: number; kind: Kind; text: string; leaving?: boolean }
const Ctx = createContext<(kind: Kind, text: string) => void>(() => {})

/** Avisos breves ("Guardado", errores de red). No bloquean la pantalla y se cierran solos; los errores duran más. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const next = useRef(1)
  const dismiss = useCallback((id: number) => {
    setItems((l) => l.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 200)
  }, [])
  const push = useCallback((kind: Kind, text: string) => {
    const id = next.current++
    setItems((l) => [...l.slice(-2), { id, kind, text }])
    setTimeout(() => dismiss(id), kind === 'error' ? 8000 : 4000)
  }, [dismiss])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="g-toasts">
        {items.map((t) => (
          <div key={t.id} data-leaving={t.leaving ? '' : undefined} role={t.kind === 'error' ? 'alert' : 'status'}
            className={`g-toast ${t.kind === 'ok' ? 'bg-ok-fondo text-ok-texto' : 'bg-error-fondo text-error-texto'}`}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {t.kind === 'ok' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 8v5m0 3.5h.01M10.3 4.2L2.8 17.5A2 2 0 004.5 20.5h15a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z" />}
            </svg>
            <p className="flex-1 font-semibold">{t.text}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Cerrar aviso" className="grid size-9 shrink-0 place-items-center rounded-control hover:bg-black/10">
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)

/** Dispara el toast cuando cambia el resultado de una acción. Devuelve nada: el error por campo lo muestra el formulario. */
export function useResultToast(state: { ok: boolean; message?: string } | null, okText = 'Guardado') {
  const toast = useToast()
  const last = useRef<unknown>(null)
  useEffect(() => {
    if (!state || last.current === state) return
    last.current = state
    toast(state.ok ? 'ok' : 'error', state.ok ? okText : state.message ?? 'No se pudo guardar')
  }, [state, toast, okText])
}
