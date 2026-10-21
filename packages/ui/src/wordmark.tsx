/**
 * Marca tipográfica de Genesis (reemplaza al logo). Variantes:
 * - font: "serif" (Cormorant, elegante) o "sans" (Montserrat liviana, muy espaciada)
 * - tone: "dark" (sobre fondo claro: violeta + tinta) o "light" (sobre fondo oscuro: lila + mármol)
 * - size: sm | md | lg | xl (solo dice GENESIS, sin bajada)
 * Siempre es texto real (accesible, se ve nítido en cualquier pantalla).
 */
type Props = { font?: 'serif' | 'sans'; tone?: 'dark' | 'light'; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }

const SIZE = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl', xl: 'text-5xl md:text-6xl' } as const

export function Wordmark({ font = 'serif', tone = 'dark', size = 'md', className = '' }: Props) {
  const a = tone === 'dark' ? 'text-violeta-oscuro' : 'text-lila'
  const b = tone === 'dark' ? 'text-tinta' : 'text-marmol'
  const face = font === 'serif' ? 'font-[family-name:var(--font-display)] font-semibold tracking-[0.16em]' : 'font-light tracking-[0.3em]'
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className={`${SIZE[size]} ${face}`}><span className={a}>GEN</span><span className={b}>ESIS</span></span>
    </span>
  )
}
