import type { ReactNode } from 'react'

/** Íconos SVG propios (trazo, 24x24). Nada de emojis ni glifos Unicode: se ven igual en todos los equipos. */
function Svg({ children, className = 'size-5', ...rest }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`inline-block shrink-0 align-[-0.15em] ${className}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  )
}
type P = { className?: string }

export const IconChevronLeft = (p: P) => <Svg {...p}><path d="M15 6l-6 6 6 6" /></Svg>
export const IconChevronRight = (p: P) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>
export const IconChevronUp = (p: P) => <Svg {...p}><path d="M6 15l6-6 6 6" /></Svg>
export const IconChevronDown = (p: P) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>
export const IconArrowLeft = (p: P) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
export const IconExternal = (p: P) => <Svg {...p}><path d="M7 17L17 7M8 7h9v9" /></Svg>
export const IconMic = (p: P) => <Svg {...p}><path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zM19 11a7 7 0 01-14 0M12 18v3" /></Svg>
export const IconCake = (p: P) => <Svg {...p}><path d="M4 20h16v-6H4zM4 14c2-2 4-2 8 0s6 2 8 0M12 11V7M12 4.5v.01" /></Svg>
export const IconWarning = (p: P) => <Svg {...p}><path d="M12 4l9 16H3L12 4zM12 10v4M12 17v.01" /></Svg>
export const IconHelp = (p: P) => <Svg {...p}><path d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-5v.01M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2" /></Svg>

/** Alertas clínicas. */
export const IconDrop = (p: P) => <Svg {...p}><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z" /></Svg>
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const IconHeart = (p: P) => <Svg {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /></Svg>
export const IconPulse = (p: P) => <Svg {...p}><path d="M3 12h4l2-5 4 10 2-5h6" /></Svg>
export const IconPerson = (p: P) => <Svg {...p}><path d="M12 8a3 3 0 100-6 3 3 0 000 6zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></Svg>

/** Logo de WhatsApp (marca de Meta). Solo se usa en el panel, para la simulación; el sitio público no lo lleva. */
export function WhatsAppLogo({ className = 'size-5' }: P) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`inline-block shrink-0 ${className}`} fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
