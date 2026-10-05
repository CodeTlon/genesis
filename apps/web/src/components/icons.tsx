import type { ReactNode } from 'react'

/** Íconos SVG del sitio (trazo, 24x24). Sin emojis. */
function Svg({ children, className = 'size-6' }: { children: ReactNode; className?: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
}
type P = { className?: string }
export const IconShield = (p: P) => <Svg {...p}><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></Svg>
export const IconHeart = (p: P) => <Svg {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /></Svg>
export const IconSparkle = (p: P) => <Svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7L19 17z" /></Svg>
export const IconCalendar = (p: P) => <Svg {...p}><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" /></Svg>
export const IconClock = (p: P) => <Svg {...p}><path d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2" /></Svg>
export const IconPin = (p: P) => <Svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><path d="M12 12a2 2 0 100-4 2 2 0 000 4z" /></Svg>
export const IconPhone = (p: P) => <Svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></Svg>
export const IconMail = (p: P) => <Svg {...p}><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></Svg>
export const IconInstagram = (p: P) => <Svg {...p}><path d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 16a4 4 0 100-8 4 4 0 000 8zM17.5 6.5v.01" /></Svg>
export const IconArrowLeft = (p: P) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
export const IconArrowRight = (p: P) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
export const IconChevronDown = (p: P) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>
export const IconArrowUp = (p: P) => <Svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>
export const IconCheck = (p: P) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
export const IconQuote = (p: P) => <Svg {...p}><path d="M9 7H6a2 2 0 00-2 2v4a2 2 0 002 2h2v2l3-3V9a2 2 0 00-2-2zM19 7h-3a2 2 0 00-2 2v4a2 2 0 002 2h2v2l3-3V9a2 2 0 00-2-2z" /></Svg>
export const IconCard = (p: P) => <Svg {...p}><path d="M3 6h18v12H3zM3 10h18" /></Svg>

export const WHY_ICONS: Record<string, (p: P) => ReactNode> = { shield: IconShield, heart: IconHeart, sparkle: IconSparkle, calendar: IconCalendar }
