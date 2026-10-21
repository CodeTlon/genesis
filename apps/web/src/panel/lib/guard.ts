import { notFound } from 'next/navigation'
import { flags } from '@/lib/flags'
import { requireUser } from './auth-server'

/** Las Server Actions son endpoints públicos: cada una de las del CMS exige sesión válida y el flag FEATURE_CMS encendido. */
export async function guardCms() {
  if (!flags.cms()) notFound()
  await requireUser()
}
