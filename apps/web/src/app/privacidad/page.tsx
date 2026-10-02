import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacidad y aviso legal' }

export default function Privacidad() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-light uppercase tracking-[0.15em]">Privacidad y aviso legal</h1>
      <p className="mt-4 rounded-card bg-lila/40 p-4 text-sm">Borrador a validar con un profesional del derecho antes de la puesta en producción.</p>

      <h2 className="mt-10 text-xl font-light uppercase tracking-[0.12em]">Qué datos pedimos</h2>
      <p className="mt-3">Al pedir un turno te pedimos tu nombre y un teléfono de contacto. Usamos esos datos solamente para responderte y coordinar tu turno.</p>

      <h2 className="mt-10 text-xl font-light uppercase tracking-[0.12em]">Datos de salud</h2>
      <p className="mt-3">Los datos de salud se consideran sensibles. Esta web no los solicita: se conversan en persona durante la consulta, con tu consentimiento.</p>

      <h2 className="mt-10 text-xl font-light uppercase tracking-[0.12em]">Tus derechos</h2>
      <p className="mt-3">Podés pedir acceso, rectificación o eliminación de tus datos de contacto cuando quieras, por Instagram o en el local. La titular de los datos puede ejercer estos derechos conforme a la Ley 25.326.</p>

      <h2 className="mt-10 text-xl font-light uppercase tracking-[0.12em]">Cookies y seguimiento</h2>
      <p className="mt-3">Este sitio no usa cookies de seguimiento, píxeles ni herramientas de analítica de terceros.</p>

      <h2 className="mt-10 text-xl font-light uppercase tracking-[0.12em]">Resultados y aviso</h2>
      <p className="mt-3">La información de este sitio es orientativa y no reemplaza la consulta profesional. Los resultados de los tratamientos varían según cada persona.</p>
    </main>
  )
}
