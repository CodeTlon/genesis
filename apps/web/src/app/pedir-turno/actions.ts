'use server'
import { z } from 'zod'
import { createRequest } from '@genesis/db/content'

const schema = z.object({
  nombre: z.string().trim().min(2, 'Escribí tu nombre.').max(80),
  telefono: z.string().trim().regex(/^[0-9 +()-]{8,20}$/, 'Revisá el teléfono: usá solo números.').refine((v) => v.replace(/\D/g, '').length >= 8, 'Revisá el teléfono: faltan números.'),
  servicio: z.string().regex(/^[a-z0-9-]{0,60}$/).optional(),
  mensaje: z.string().trim().max(500).optional(),
  acepto: z.literal('on', { errorMap: () => ({ message: 'Necesitamos tu OK para usar estos datos.' }) }),
  web: z.string().optional(), // honeypot
})

export type TurnoState = { ok: boolean; errors?: Record<string, string>; message?: string } | null

export async function pedirTurno(_prev: unknown, formData: FormData): Promise<TurnoState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message
    return { ok: false, errors }
  }
  // Honeypot: los bots reciben el mismo éxito, sin pistas.
  if (parsed.data.web) return { ok: true, message: 'Recibimos tu pedido. Te vamos a contactar para confirmar el turno.' }
  // Demo sin base de datos: simulamos el envío para que se pueda probar el recorrido completo.
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    return { ok: true, message: 'Recibimos tu pedido. Te vamos a contactar para confirmar el turno. (Demo: en el sitio real, el pedido le llega a la profesional.)' }
  }
  try {
    await createRequest({ name: parsed.data.nombre, phone: parsed.data.telefono, service_slug: parsed.data.servicio, note: parsed.data.mensaje })
  } catch {
    return { ok: false, errors: { form: 'No pudimos enviar tu pedido. Probá de nuevo en un rato.' } }
  }
  return { ok: true, message: 'Recibimos tu pedido. Te vamos a contactar para confirmar el turno.' }
}
