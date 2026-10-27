'use client'
import { useEffect } from 'react'

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

function message(el: Field): string {
  const v = el.validity
  const kind = el instanceof HTMLInputElement ? el.type : ''
  if (v.valueMissing) return kind === 'checkbox' || kind === 'radio' ? 'Marcá esta opción para continuar.' : el instanceof HTMLSelectElement ? 'Elegí una opción.' : kind === 'file' ? 'Elegí un archivo.' : 'Completá este campo.'
  if (v.typeMismatch && kind === 'email') return 'Escribí un correo válido, por ejemplo nombre@correo.com.'
  if (v.tooShort) return `Escribí al menos ${el.getAttribute('minlength')} caracteres.`
  if (v.rangeUnderflow || v.rangeOverflow) return 'El valor está fuera del rango permitido.'
  if (v.patternMismatch) return 'El formato no es válido.'
  return el.validationMessage
}

const errId = (el: Field) => `${el.id || el.name}-error`

function clear(el: Field) {
  document.getElementById(errId(el))?.remove()
  el.removeAttribute('aria-invalid')
  el.removeAttribute('aria-describedby')
}

/**
 * Reemplaza los globos de validación del navegador por un mensaje propio debajo de cada campo.
 * Se monta una sola vez en el layout; no toca los formularios ni cambia qué campos son obligatorios.
 */
export function FormValidity() {
  useEffect(() => {
    let first = true
    const onInvalid = (e: Event) => {
      e.preventDefault() // sin esto el navegador muestra su propio globo
      const el = e.target as Field
      clear(el)
      const p = document.createElement('p')
      p.id = errId(el)
      p.setAttribute('role', 'alert')
      p.className = 'g-reveal mt-1 font-semibold text-error-texto'
      p.textContent = message(el)
      const anchor = el.parentElement?.classList.contains('relative') ? el.parentElement : el
      anchor.after(p)
      el.setAttribute('aria-invalid', 'true')
      el.setAttribute('aria-describedby', p.id)
      if (first) { first = false; el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => { first = true }, 0) }
    }
    const onInput = (e: Event) => {
      const el = e.target as Field
      if (el.getAttribute('aria-invalid') === 'true' && el.validity?.valid) clear(el)
    }
    document.addEventListener('invalid', onInvalid, true)
    document.addEventListener('input', onInput, true)
    document.addEventListener('change', onInput, true)
    return () => {
      document.removeEventListener('invalid', onInvalid, true)
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('change', onInput, true)
    }
  }, [])
  return null
}
