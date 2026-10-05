'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Entrada suave al hacer scroll. IntersectionObserver + CSS, sin dependencias; respeta prefers-reduced-motion (ver tokens.css).
 * El HTML del servidor sale visible (sin JS o con JS tardío no se pierde contenido); el estado "oculto" se aplica recién al montar y solo si el bloque está fuera de pantalla, sin transición (si no, se vería un desvanecimiento al hidratar); solo la aparición es animada.
 */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return
    setHidden(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHidden(false); io.disconnect() } }, { rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ transitionDelay: hidden ? '0ms' : `${delay}ms`, transitionDuration: hidden ? '0ms' : '700ms' }} className={`transition ${hidden ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'} ${className}`}>
      {children}
    </div>
  )
}
