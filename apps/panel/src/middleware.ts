import { NextResponse, type NextRequest } from 'next/server'
import { verifySession } from './lib/session'

// Toda ruta salvo /login exige una sesión firmada (cookie gs). Incluye las fotos clínicas (REQ-FOT-003).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/robots.txt' || pathname === '/logo.webp') return NextResponse.next()
  if (await verifySession(req.cookies.get('gs')?.value)) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] }
