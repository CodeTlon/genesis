'use client'
import { useRef, type ReactNode } from 'react'

/** Adaptado de react-bits SpotlightCard: tema claro, foco por teclado, sin depender del hover. La posición va en variables CSS (sin re-render por cada movimiento del mouse). */
export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const show = (on: boolean) => { if (glow.current) glow.current.style.opacity = on ? '0.7' : '0' }
  return (
    <div
      ref={ref}
      onMouseMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (r && glow.current) { glow.current.style.setProperty('--x', `${e.clientX - r.left}px`); glow.current.style.setProperty('--y', `${e.clientY - r.top}px`) } }}
      onMouseEnter={() => show(true)}
      onMouseLeave={() => show(false)}
      onFocus={() => show(true)}
      onBlur={() => show(false)}
      className={`relative h-full overflow-hidden rounded-card bg-white shadow-soft transition-shadow duration-300 hover:shadow-lg ${className}`}
    >
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(201,167,235,0.45), transparent 70%)' }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
