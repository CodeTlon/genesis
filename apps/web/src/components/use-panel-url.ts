'use client'
import { useEffect, useState } from 'react'

/** Pide la URL del panel al servidor (se resuelve en cada visita). null = cargando, '' = no hay panel publicado. */
export function usePanelUrl() {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    fetch('/api/panel-url').then((r) => r.json()).then((d: { url?: string }) => { if (alive) setUrl(d.url ?? '') }).catch(() => { if (alive) setUrl('') })
    return () => { alive = false }
  }, [])
  return url
}
