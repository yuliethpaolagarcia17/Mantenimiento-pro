import { NextResponse } from 'next/server'

export function middleware(request) {
  const isLoginPage = request.nextUrl.pathname === '/login'
  
  if (isLoginPage) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}