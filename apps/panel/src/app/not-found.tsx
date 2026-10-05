import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="g-enter mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl uppercase tracking-[0.06em]">No encontramos esa página</h1>
      <p className="mt-4 text-lg">Puede que el enlace esté desactualizado. Volvé al inicio y seguí desde ahí.</p>
      <Link href="/hoy" className="mt-8 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-8 text-white hover:bg-tinta">Ir a Hoy</Link>
    </main>
  )
}
