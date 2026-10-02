import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conocé a Genesis Estética Integral: podología y estética en un mismo lugar, en Colorado 5827, Córdoba.',
}

export default function Nosotros() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Nosotros</h1>
      <p className="mt-6 text-lg">Genesis nació para cuidar la salud y el bienestar de las personas desde los pies hasta el rostro, en un ambiente cálido y tranquilo.</p>
      <p className="mt-4">Inés atiende podología. En el piso de arriba funciona el área de estética, con el mismo nombre y el mismo cuidado: tratamientos faciales y corporales, depilación, cejas, pestañas y uñas.</p>

      <h2 className="mt-12 text-xl font-light uppercase tracking-[0.12em]">Equipo</h2>
      <ul className="mt-4 space-y-3">
        <li className="rounded-card bg-white p-5 shadow-soft">
          <p className="font-semibold">Inés</p>
          <p>Podología · Matrícula profesional: <span className="italic">a completar</span></p>
        </li>
        <li className="rounded-card bg-white p-5 shadow-soft">
          <p className="font-semibold">Equipo de estética</p>
          <p>Integrantes y matrículas: <span className="italic">a completar</span></p>
        </li>
      </ul>

      <h2 className="mt-12 text-xl font-light uppercase tracking-[0.12em]">Cómo trabajamos</h2>
      <p className="mt-4">En la primera consulta conversamos sobre lo que necesitás y revisamos tus antecedentes para cuidarte. Después te proponemos un plan, sin apuros.</p>
      <Link href="/pedir-turno" className="mt-8 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white">Pedir turno</Link>
    </main>
  )
}
