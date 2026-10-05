'use client'
import { IconArrowUp } from './icons'

export function BackToTop() {
  return (
    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex min-h-touch items-center gap-2 rounded-control border border-white/30 px-4 transition-colors hover:bg-white/10">
      <IconArrowUp className="size-5" />Volver arriba
    </button>
  )
}
