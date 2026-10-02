'use client'

export function PrintButton({ label = 'Imprimir el día' }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="min-h-touch rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">
      {label}
    </button>
  )
}
