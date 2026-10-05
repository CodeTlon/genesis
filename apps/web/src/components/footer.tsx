import { Wordmark } from '@genesis/ui/wordmark'
import Link from 'next/link'
import { getContent, getGroups } from '@genesis/db/content'
import { SITE } from '@/lib/site'
import { BackToTop } from './back-to-top'
import { IconCard, IconClock, IconInstagram, IconMail, IconPhone, IconPin } from './icons'

const head = 'font-label text-base uppercase tracking-widest text-lila'
const link = 'inline-block py-1 hover:underline'

export async function Footer() {
  const [contact, groups] = await Promise.all([getContent('contact'), getGroups()])
  return (
    <footer className="mt-24 bg-tinta text-marmol">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark font="sans" tone="light" size="lg" tagline />
          <p className="mt-4 text-base">Podología y estética en un mismo lugar. Atención personalizada, en un ambiente tranquilo.</p>
          <a href={contact.instagram} rel="noopener noreferrer" className="mt-4 inline-flex min-h-touch items-center gap-2 hover:underline"><IconInstagram className="size-6" />{contact.instagramHandle}</a>
        </div>

        <nav aria-label="Servicios">
          <p className={head}>Servicios</p>
          <ul className="mt-3 space-y-1 text-base">
            {groups.map((g) => <li key={g.slug}><Link href={`/servicios/${g.slug}`} className={link}>{g.name}</Link></li>)}
          </ul>
        </nav>

        <div>
          <p className={head}>Visitanos</p>
          <ul className="mt-3 space-y-3 text-base">
            <li className="flex gap-3"><IconPin className="mt-0.5 size-5 text-lila" /><span>{contact.address}</span></li>
            {contact.hours.map((h) => <li key={h} className="flex gap-3"><IconClock className="mt-0.5 size-5 text-lila" /><span>{h}</span></li>)}
            {contact.phone && <li className="flex gap-3"><IconPhone className="mt-0.5 size-5 text-lila" /><a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="hover:underline">{contact.phone}</a></li>}
            {contact.email && <li className="flex gap-3"><IconMail className="mt-0.5 size-5 text-lila" /><a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a></li>}
          </ul>
        </div>

        <nav aria-label="Más">
          <p className={head}>Más</p>
          <ul className="mt-3 space-y-1 text-base">
            <li><Link href="/pedir-turno" className={link}>Pedir turno</Link></li>
            <li><Link href="/nosotros" className={link}>Nosotros</Link></li>
            <li><Link href="/preguntas-frecuentes" className={link}>Preguntas frecuentes</Link></li>
            <li><Link href="/consejos" className={link}>Consejos</Link></li>
            <li><Link href="/galeria" className={link}>Galería</Link></li>
            <li><Link href="/privacidad" className={link}>Privacidad y aviso legal</Link></li>
            {SITE.panelUrl && <li><a href={`${SITE.panelUrl}/login?tour=1`} className={`${link} font-semibold text-lila`}>Ver demo guiada del panel</a></li>}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base"><IconCard className="size-5 text-lila" />{contact.payment.join(' · ')}</p>
          <BackToTop />
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-sm text-marmol/80">© {new Date().getFullYear()} {SITE.name}. Demo con datos ficticios.</p>
    </footer>
  )
}
