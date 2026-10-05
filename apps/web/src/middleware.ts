import { NextResponse, type NextRequest } from 'next/server'

// Demo: el panel (/panel) no pide contraseña por defecto (botón "Entrar como..."). Si se define DEMO_PASSWORD, se exige.
// El sitio público no pasa por acá (ver matcher).
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/panel/login') return NextResponse.next()
  const expected = await token(process.env.DEMO_PASSWORD)
  if (req.cookies.get('gp')?.value === expected) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/panel/login'
  url.search = req.nextUrl.searchParams.get('tour') === '1' ? '?tour=1' : ''
  return NextResponse.redirect(url)
}

async function token(pw?: string) {
  if (!pw) return 'open'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`genesis:${pw}`))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const config = { matcher: ['/panel', '/panel/:path*'] }
