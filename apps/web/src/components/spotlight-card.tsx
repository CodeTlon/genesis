'use client'
import { useRef, useState, type ReactNode } from 'react'

/** Adaptado de react-bits SpotlightCard: tema claro, foco por teclado, sin depender del hover. */
export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [on, setOn] = useState(false)
  return (
    <div
      ref={ref}
      onMouseMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top }) }}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
      className={`relative overflow-hidden rounded-card bg-white shadow-soft ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ opacity: on ? 0.7 : 0, background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(201,167,235,0.45), transparent 70%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
