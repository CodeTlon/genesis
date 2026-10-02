'use client'
import { useState } from 'react'

// Tarifas orientativas (USD por mensaje): fuentes difieren levemente; verificar la tarifa oficial de Meta.
const UTILITY = 0.028
const MARKETING = 0.066
const FREE_SERVICE = 1000

export function MessagingCost() {
  const [utility, setUtility] = useState(300)
  const [marketing, setMarketing] = useState(0)
  const [service, setService] = useState(400)
  const billableService = Math.max(0, service - FREE_SERVICE)
  const total = utility * UTILITY + marketing * MARKETING + billableService * UTILITY

  const f = 'mt-1 block min-h-touch w-32 rounded-control border border-tinta/40 px-3'
  return (
    <section className="rounded-card bg-white p-5 shadow-soft" aria-labelledby="costo">
      <h2 id="costo" className="text-lg font-semibold">Gasto estimado de mensajería (mes)</h2>
      <div className="mt-3 flex flex-wrap gap-4">
        <label>Recordatorios y avisos<input type="number" min={0} value={utility} onChange={(e) => setUtility(+e.target.value)} className={f} /></label>
        <label>Conversaciones de servicio<input type="number" min={0} value={service} onChange={(e) => setService(+e.target.value)} className={f} /></label>
        <label>Promociones<input type="number" min={0} value={marketing} onChange={(e) => setMarketing(+e.target.value)} className={f} /></label>
      </div>
      <p className="mt-4 text-3xl font-light">≈ USD {total.toFixed(2)}</p>
      <p className="mt-1 text-sm">Estimación orientativa: 1.000 mensajes de servicio gratis por mes; avisos ≈ USD 0,028 y promociones ≈ USD 0,066 cada uno. Hay que verificar la tarifa oficial de Meta.</p>
    </section>
  )
}
