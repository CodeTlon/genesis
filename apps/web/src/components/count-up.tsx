'use client'
import { useEffect, useRef, useState } from 'react'

/** Contador que sube al aparecer en pantalla. Sin librerías; con prefers-reduced-motion muestra el número final directo. */
export function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(to) // el servidor y quien no tiene JS ven el número final
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setN(0)
    let raf = 0
    const fallback = setTimeout(() => setN(to), 2500) // si la animación no llega a arrancar, nunca queda mostrando 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect(); clearTimeout(fallback)
      const t0 = performance.now(), dur = 1400
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur)
        setN(Math.round(to * (1 - (1 - k) ** 3)))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => { io.disconnect(); clearTimeout(fallback); cancelAnimationFrame(raf) }
  }, [to])
  return <span ref={ref}>{n.toLocaleString('es-AR')}{suffix}</span>
}
