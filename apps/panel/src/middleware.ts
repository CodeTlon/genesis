import { NextResponse, type NextRequest } from 'next/server'

// Demo: acceso protegido con una contraseña única (DEMO_PASSWORD). Fase 1: auth real con Argon2id + TOTP.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/robots.txt' || pathname === '/logo.webp') return NextResponse.next()
  const expected = await token(process.env.DEMO_PASSWORD ?? 'genesis-demo')
  if (req.cookies.get('gp')?.value === expected) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  return NextResponse.redirect(url)
}

async function token(pw: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`genesis:${pw}`))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] }
