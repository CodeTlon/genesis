import { NextResponse, type NextRequest } from 'next/server'

// Demo: sin contraseña por defecto (botón "Entrar a la demo"). Si se define DEMO_PASSWORD, se exige.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/robots.txt') return NextResponse.next()
  const expected = await token(process.env.DEMO_PASSWORD)
  if (req.cookies.get('gp')?.value === expected) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = req.nextUrl.searchParams.get('tour') === '1' ? '?tour=1' : ''
  return NextResponse.redirect(url)
}

async function token(pw?: string) {
  if (!pw) return 'open'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`genesis:${pw}`))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] }
