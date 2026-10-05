'use client'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main role="alert" className="g-enter mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl uppercase tracking-[0.06em]">Algo no salió bien</h1>
      <p className="mt-4 text-lg">No es tu culpa. Probá de nuevo; si sigue pasando, volvé al inicio.</p>
      <button onClick={reset} className="mt-8 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-8 text-white hover:bg-tinta">Probar de nuevo</button>
    </main>
  )
}
