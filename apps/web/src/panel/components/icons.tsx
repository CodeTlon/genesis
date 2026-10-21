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
