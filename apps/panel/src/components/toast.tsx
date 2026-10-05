'use client'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import SwipeToast from '@genesis/ui/vendor/SwipeToast'

type ToastInput = { title: string; description?: string; actionLabel?: string; onAction?: () => void; error?: boolean }
type Item = ToastInput & { id: number }

const Ctx = createContext<{ toast: (t: ToastInput) => void }>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

let seq = 0

/** Avisos propios (nunca alert/confirm del navegador): deslizables, con "Deshacer" opcional y barra de tiempo. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const toast = useCallback((t: ToastInput) => setItems((p) => [...p.slice(-2), { ...t, id: ++seq }]), [])
  const value = useMemo(() => ({ toast }), [toast])
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 top-3 z-50 flex flex-col items-center gap-2 md:items-end md:pr-3 print:hidden">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full max-w-sm">
            <SwipeToast
              inline open
              title={t.title}
              description={t.description}
              actionLabel={t.actionLabel}
              onAction={t.onAction}
              onClose={() => setItems((p) => p.filter((x) => x.id !== t.id))}
              background={t.error ? '#7f1d1d' : 'var(--color-tinta)'}
              color="var(--color-marmol)"
              fuseColor={t.error ? '#fecaca' : 'var(--color-lila)'}
              duration={t.error ? 7000 : 4500}
              fuse="bottom"
              closeButton
              width={384}
            />
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
