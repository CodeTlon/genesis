'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

/** Búsqueda en vivo: filtra mientras se escribe (espera 250 ms). Sin JavaScript sigue funcionando por envío del formulario (GET). */
export function PatientSearch({ initial }: { initial: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [pending, start] = useTransition()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const t = setTimeout(() => start(() => router.replace(value.trim() ? `/panel/pacientes?q=${encodeURIComponent(value.trim())}` : '/panel/pacientes', { scroll: false })), 250)
    return () => clearTimeout(t)
  }, [value, router])
  return (
    <form role="search" className="relative flex max-w-xl gap-2" onSubmit={(e) => e.preventDefault()} action="/panel/pacientes">
      <label className="sr-only" htmlFor="q">Buscar por nombre, DNI o teléfono</label>
      <div className="relative flex-1">
        <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
        <input id="q" name="q" type="search" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" placeholder="Nombre, DNI o teléfono"
          className="min-h-touch w-full rounded-control border border-tinta/60 bg-white pl-12 pr-4 placeholder:text-tinta-suave" />
      </div>
      <noscript><button className="min-h-touch rounded-control bg-violeta-oscuro px-5 font-semibold text-white">Buscar</button></noscript>
      <span role="status" className="sr-only">{pending ? 'Buscando...' : ''}</span>
    </form>
  )
}
