'use client'
import { useState } from 'react'
import WarmTooltip from '@genesis/ui/vendor/WarmTooltip'

/** Glosario: explica en una línea la jerga de la historia clínica, sin llenar la pantalla. */
const GLOSSARY = {
  adenda: 'Una nota que se agrega a una atención ya firmada. La firmada no se borra ni se edita: así queda el registro completo.',
  firmar: 'Cerrar la atención con tu firma. Después ya no se puede editar, solo agregar adendas.',
  'en sala': 'La paciente ya llegó y está en la sala de atención.',
  consentimiento: 'Autorización de la paciente para guardar sus datos o usar sus fotos. Se puede retirar cuando quiera.',
} as const

export function Term({ k, children }: { k: keyof typeof GLOSSARY; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const dotted = 'underline decoration-dotted decoration-violeta-oscuro underline-offset-4'
  return (
    <>
      {/* Mouse: tooltip al pasar o con foco de teclado */}
      <span className="pointer-coarse:hidden">
        <WarmTooltip content={GLOSSARY[k]} surfaceColor="var(--color-tinta)" inkColor="var(--color-marmol)" size="lg">
          <span tabIndex={0} className={`cursor-help ${dotted}`}>{children}</span>
        </WarmTooltip>
      </span>
      {/* Pantalla táctil: no hay hover, así que se despliega con un toque */}
      <span className="hidden pointer-coarse:inline">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={dotted}>{children}</button>
        {open && <span role="note" className="g-enter mt-2 block rounded-control bg-tinta p-3 text-base text-marmol">{GLOSSARY[k]}</span>}
      </span>
    </>
  )
}
