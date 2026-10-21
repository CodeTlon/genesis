import Link from 'next/link'
import '@/app/globals.css'
import { fontVars } from '@/fonts'
import { Wordmark } from '@genesis/ui/wordmark'

// 404 global. Con dos layouts raíz (sitio y panel) las URLs inexistentes no pasan por ninguno, así que este lleva su propio <html>.
export default function NotFound() {
  return (
    <html lang="es-AR" className={fontVars}>
      <body>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
          <Wordmark size="lg" />
          <h1 className="mt-10 text-3xl uppercase tracking-[0.06em]">No encontramos esa página</h1>
          <p className="mt-4 text-lg">Puede que el enlace esté desactualizado. Volvé al inicio y seguí desde ahí.</p>
          <Link href="/" className="mt-8 inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-8 text-white hover:bg-tinta">Ir al inicio</Link>
        </main>
      </body>
    </html>
  )
}
