'use client'
import { useLayoutEffect, useRef, useState } from 'react'

/** Texto largo recortado a unas líneas con «Ver más / Ver menos»; si entra completo no muestra el botón. */
export function ClampText({ children, lines = 4, className = '' }: { children: string; lines?: number; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const [overflow, setOverflow] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (el && !open) setOverflow(el.scrollHeight > el.clientHeight + 1)
  }, [children, open, lines])
  return (
    <div>
      <p ref={ref} className={className} style={open ? undefined : { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{children}</p>
      {(overflow || open) && <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-violeta-oscuro hover:underline">{open ? 'Ver menos' : 'Ver más'}</button>}
    </div>
  )
}
