import { redirect } from 'next/navigation'

// No hay sitio público: la raíz lleva al panel.
export default function Raiz() {
  redirect('/panel')
}
