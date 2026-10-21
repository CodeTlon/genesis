import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Filtro barato: sin cookie de sesión → login. La validación real (sesión vigente en la base, rol y pertenencia del dato)
// la hace el servidor en cada página y acción (panel/lib/auth-server.ts).
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === '/panel/login') return NextResponse.next()
  if (getSessionCookie(req)) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/panel/login'
  url.search = ''
  return NextResponse.redirect(url)
}

// Solo el panel. La raíz redirige sola; las APIs y las fotos validan sesión por su cuenta.
export const config = { matcher: ['/panel', '/panel/:path*'] }
