'use client'
import { usePanelUrl } from './use-panel-url'

export function PanelLink({ className }: { className?: string }) {
  const url = usePanelUrl()
  if (!url) return null
  return <a href={`${url}/login?tour=1`} className={className}>Ver demo guiada del panel</a>
}
