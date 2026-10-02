'use server'
import { z } from 'zod'
import { createRequest } from '@genesis/db/content'

const schema = z.object({
  nombre: z.string().trim().min(2, 'Escribí tu nombre.').max(80),
  telefono: z.string().trim().regex(/^[0-9 +()-]{8,20}$/, 'Revisá el teléfono: usá solo números.'),
  servicio: z.string().max(60).optional(),
  mensaje: z.string().trim().max(500).optional(),
  acepto: z.literal('on', { errorMap: () => ({ message: 'Necesitamos tu OK para usar estos datos.' }) }),
  web: z.string().max(0).optional(), // honeypot
})

export type TurnoState = { ok: boolean; errors?: Record<string, string>; message?: string } | null

export async function pedirTurno(_prev: unknown, formData: FormData): Promise<TurnoState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message
    return { ok: false, errors }
  }
  try {
    await createRequest({ name: parsed.data.nombre, phone: parsed.data.telefono, service_slug: parsed.data.servicio, note: parsed.data.mensaje })
  } catch {
    return { ok: false, errors: { form: 'No pudimos enviar tu pedido. Probá de nuevo en un rato.' } }
  }
  return { ok: true, message: 'Recibimos tu pedido. Te vamos a contactar para confirmar el turno.' }
}
