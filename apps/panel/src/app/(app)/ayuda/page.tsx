import { Onboarding } from '@/components/onboarding'

export default function Ayuda() {
  return (
    <main>
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Ayuda</h1>
      <p className="mt-2 mb-8">Un recorrido de 5 pasos para aprender a usar el sistema.</p>
      <Onboarding />
      <section className="mt-12 rounded-card bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold">¿Necesitás ayuda?</h2>
        <p className="mt-2">Escribinos y te respondemos a la brevedad.</p>
        <a href="mailto:mateopavoni905@gmail.com?subject=Ayuda%20con%20el%20panel%20Genesis" className="mt-4 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white">Pedir ayuda</a>
      </section>
    </main>
  )
}
