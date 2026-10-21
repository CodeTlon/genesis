import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { flags } from '@/lib/flags'

// Filtro barato. Panel: sin cookie de sesión → login (la validación real contra la base y el rol la hace el servidor en cada
// página y acción: panel/lib/auth-server.ts). Sitio público: si FEATURE_SITE no está activo, todo redirige al panel.
export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (!path.startsWith('/panel')) {
    if (flags.site()) return NextResponse.next()
    const url = req.nextUrl.clone()
    url.pathname = '/panel'
    url.search = ''
    return NextResponse.redirect(url)
  }
  if (path === '/panel/login') return NextResponse.next()
  if (getSessionCookie(req)) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/panel/login'
  url.search = ''
  return NextResponse.redirect(url)
}

// Excluye internos de Next, APIs (tienen su propia validación), medios y archivos estáticos.
export const config = { matcher: ['/((?!_next/|api/|panel-media/|media/|img/|fonts/|favicon.ico|icon.svg|apple-icon.png).*)'] }
