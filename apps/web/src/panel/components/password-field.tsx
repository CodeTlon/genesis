'use client'
import { useState } from 'react'

const ICON = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

/** Campo de contraseña con botón ojo para mostrar u ocultar lo escrito. */
export function PasswordField({ invalid }: { invalid: boolean }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="relative mt-1">
      <input id="password" name="password" type={shown ? 'text' : 'password'} autoComplete="current-password" placeholder="Tu contraseña" required aria-invalid={invalid}
        className="block min-h-touch w-full rounded-control border border-tinta/60 bg-white pl-4 pr-14 placeholder:text-tinta-suave" />
      <button type="button" onClick={() => setShown((v) => !v)} aria-pressed={shown} aria-label="Mostrar clave"
        className="absolute inset-y-0 right-0 flex w-touch items-center justify-center rounded-control text-tinta-suave transition-colors hover:text-tinta">
        {shown ? (
          <svg {...ICON}><path d="M3 3l18 18" /><path d="M10.6 6.1A10.5 10.5 0 0 1 12 6c5 0 8.5 4.2 9.5 6-.4.8-1.3 2-2.6 3.2M6.5 7.6C4.3 9 2.9 11 2.5 12c1 1.8 4.5 6 9.5 6 1.5 0 2.9-.4 4-.9" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
        ) : (
          <svg {...ICON}><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </div>
  )
}
