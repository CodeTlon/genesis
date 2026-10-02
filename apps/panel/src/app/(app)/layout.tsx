import Image from 'next/image'
import Link from 'next/link'

const NAV = [
  { href: '/hoy', label: 'Hoy', icon: '☀' },
  { href: '/agenda', label: 'Agenda', icon: '▦' },
  { href: '/pacientes', label: 'Pacientes', icon: '☺' },
  { href: '/whatsapp', label: 'WhatsApp', icon: '✉' },
  { href: '/plantillas', label: 'Plantillas', icon: '☰' },
  { href: '/ayuda', label: 'Ayuda', icon: '?' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="print:hidden border-b border-lila/50 bg-white md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-4 py-4">
          <Image src="/logo.webp" alt="" width={44} height={44} className="rounded-full" />
          <span className="font-light uppercase tracking-[0.18em]">Genesis</span>
        </div>
        <nav aria-label="Principal" className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex min-h-touch shrink-0 items-center gap-3 rounded-control px-4 hover:bg-lila/40">
              <span aria-hidden className="w-5 text-center text-violeta-oscuro">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <p className="print:hidden bg-tinta px-4 py-2 text-center text-sm text-marmol">
          Modo capacitación · Demo con datos 100 % ficticios · Podés practicar sin miedo
        </p>
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </div>
    </div>
  )
}
