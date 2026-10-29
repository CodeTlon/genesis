'use client'
import { useEffect, useRef, useState } from 'react'

/** Número que cuenta hacia arriba al aparecer. Sin dependencias; con `prefers-reduced-motion` se muestra directo. El valor final siempre está en el DOM para lectores de pantalla. */
export function CountUp({ value, duration = 700, className }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || value <= 0) return // se queda el valor final
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3)) * (p === 0 ? 0 : 1)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return (
    <span ref={ref} className={className}>
      <span aria-hidden>{shown.toLocaleString('es-AR')}</span>
      <span className="sr-only">{value.toLocaleString('es-AR')}</span>
    </span>
  )
}
