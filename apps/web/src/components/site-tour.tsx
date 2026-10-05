'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { IconArrowRight, IconCheck, IconSparkle } from './icons'

const STEPS = [
  { href: '/', title: 'Bienvenida a la demo', text: 'Este es el sitio público, lo que ven las personas que buscan Genesis. Mirá la portada: horarios, servicios, opiniones y preguntas frecuentes.' },
  { href: '/servicios', title: 'Servicios', text: 'Los tratamientos están agrupados por tema. Entrá a un grupo para ver duración, precios orientativos, cuidados y preguntas frecuentes.' },
  { href: '/nosotros', title: 'Nosotros', text: 'Quiénes somos, qué nos importa, nuestra historia y cómo cuidamos la higiene y la bioseguridad.' },
  { href: '/pedir-turno', title: 'Pedir un turno', text: 'Probá el formulario con datos de práctica. Un pedido no es un turno confirmado: le llega al equipo, que lo confirma.' },
] as const

const KEY = 'genesis-site-tour'

/** Demo guiada del sitio: arranca sola la primera vez y termina llevando al panel (donde sigue la guía). Estado solo en sessionStorage. */
export function SiteTour({ panelUrl }: { panelUrl: string }) {
  const router = useRouter()
  const path = usePathname()
  const [step, setStep] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('guia') === '1') { sessionStorage.setItem(KEY, '0'); window.history.replaceState(null, '', window.location.pathname) }
      const saved = sessionStorage.getItem(KEY)
      setStep(saved === null ? 0 : saved === 'off' ? null : Number(saved))
    } catch { setStep(0) }
  }, [])

  const go = (n: number | null) => {
    setStep(n)
    try { sessionStorage.setItem(KEY, n === null ? 'off' : String(n)) } catch { /* sin storage: sigue funcionando */ }
    if (n !== null && n < STEPS.length) router.push(STEPS[n].href)
  }

  if (step === undefined) return null
  if (step === null) {
    return (
      <button onClick={() => go(0)} aria-label="Demo guiada" className="print:hidden fixed bottom-4 right-4 z-40 flex min-h-touch items-center gap-2 rounded-full bg-violeta-oscuro px-5 text-white shadow-soft transition-colors hover:bg-tinta">
        <IconSparkle className="size-5" /><span className="hidden sm:inline">Demo guiada</span>
      </button>
    )
  }

  const done = step >= STEPS.length
  const s = STEPS[Math.min(step, STEPS.length - 1)]
  const onScreen = !done && path === s.href
  return (
    <aside role="dialog" aria-label="Demo guiada" className="g-enter print:hidden fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-card border border-lila bg-white p-5 shadow-soft md:inset-x-auto md:bottom-4 md:right-4">
      {done ? (
        <>
          <h2 className="text-lg font-semibold">Ahora, el panel del equipo</h2>
          <p className="mt-2">Así gestiona Genesis sus pacientes, la agenda y este mismo sitio. Entrás con un perfil de práctica, sin contraseña, y la guía sigue allá.</p>
          {panelUrl
            ? <a href={`${panelUrl}/login?tour=1`} className="mt-4 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-control bg-violeta-oscuro px-4 text-white hover:bg-tinta">Seguir en el panel<IconArrowRight className="size-5" /></a>
            : <p className="mt-3 rounded-control bg-lila/40 p-3 text-sm">El panel no está conectado en esta versión.</p>}
        </>
      ) : (
        <>
          <p className="text-sm" aria-live="polite">Paso {step + 1} de {STEPS.length + 1}</p>
          <div aria-hidden className="mt-2 flex gap-1.5">
            {STEPS.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-violeta-oscuro' : 'bg-lila/60'}`} />)}
            <span className="h-1.5 flex-1 rounded-full bg-lila/60" />
          </div>
          <h2 className="mt-3 text-lg font-semibold">{s.title}</h2>
          <p className="mt-2">{s.text}</p>
          {!onScreen && <button onClick={() => router.push(s.href)} className="mt-3 min-h-touch w-full rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro hover:bg-lila/40">Llevame a esta página</button>}
        </>
      )}
      <div className="mt-4 flex gap-2">
        {step > 0 && !done && <button onClick={() => go(step - 1)} className="min-h-touch rounded-control border border-tinta/60 px-4 hover:bg-lila/40">Anterior</button>}
        {!done && <button onClick={() => go(step + 1)} className="flex min-h-touch flex-1 items-center justify-center gap-2 rounded-control bg-violeta-oscuro px-4 text-white hover:bg-tinta">Siguiente{step === STEPS.length - 1 && <IconCheck className="size-5" />}</button>}
        <button onClick={() => go(null)} className="min-h-touch rounded-control px-3 hover:bg-lila/40">{done ? 'Cerrar' : 'Saltar'}</button>
      </div>
    </aside>
  )
}
