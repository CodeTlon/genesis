import { query, TENANT_ID } from '@genesis/db/client'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const TXT: Record<string, string> = {
  ingreso: 'Ingresó al panel', salida: 'Salió del panel', abrir_historia: 'Abrió la historia', crear_atencion: 'Creó una atención', firmar_atencion: 'Firmó una atención',
  agregar_adenda: 'Agregó una adenda', guardar_paciente: 'Guardó datos del paciente', subir_foto: 'Subió una foto', ver_foto: 'Vio una foto', registrar_consentimiento: 'Registró un consentimiento',
}

/** REQ-SEG-005: registro de accesos, solo lectura. No hay ninguna acción que lo modifique ni lo borre. */
export default async function Auditoria() {
  await requireUser()
  const rows = await query<{ at: Date; user_name: string; action: string; patient_id: string | null; detail: string | null }>(
    'SELECT at, user_name, action, patient_id, detail FROM hc_audit WHERE tenant_id=$1 ORDER BY id DESC LIMIT 200', [TENANT_ID])
  return (
    <main>
      <h1 className="text-3xl font-light">Registro de accesos</h1>
      <p className="mt-2">Quién abrió, creó o corrigió cada historia, con fecha y hora. No se puede borrar ni editar desde el panel.</p>
      <div className="mt-4 overflow-x-auto rounded-card bg-white shadow-soft">
        <table className="w-full text-left">
          <thead className="bg-lila/30"><tr><th className="p-3">Fecha y hora</th><th className="p-3">Profesional</th><th className="p-3">Acción</th><th className="p-3">Paciente</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-lila/40">
                <td className="p-3 whitespace-nowrap">{new Date(r.at).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</td>
                <td className="p-3">{r.user_name}</td>
                <td className="p-3">{TXT[r.action] ?? r.action}{r.detail && r.action !== 'ver_foto' ? ` (${r.detail})` : ''}</td>
                <td className="p-3">{r.patient_id ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
