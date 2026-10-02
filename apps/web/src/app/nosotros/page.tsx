import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getContent } from '@genesis/db/content'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conocé a Genesis Estética Integral: podología y estética en un mismo lugar, en Córdoba.',
}

export default async function Nosotros() {
  const [about, team] = await Promise.all([getContent('about'), getContent('team')])
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">{about.title}</h1>
      <p className="mt-6 text-lg">{about.lead}</p>
      <p className="mt-4">{about.body}</p>

      {team.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-light uppercase tracking-[0.12em]">Equipo</h2>
          <ul className="mt-4 space-y-3">
            {team.map((m, i) => (
              <li key={i} className="flex items-center gap-4 rounded-card bg-white p-5 shadow-soft">
                {m.photo && <Image src={m.photo} alt={`Foto de ${m.name}`} width={72} height={72} className="size-[72px] rounded-full object-cover" />}
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p>{m.role}{m.license ? ` · Matrícula ${m.license}` : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-12 text-xl font-light uppercase tracking-[0.12em]">{about.howTitle}</h2>
      <p className="mt-4">{about.how}</p>
      <Link href="/pedir-turno" className="mt-8 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white">Pedir turno</Link>
    </main>
  )
}
