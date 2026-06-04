import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/auth')
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/symptoms') ||
    pathname.startsWith('/insights') ||
    pathname.startsWith('/community') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications')

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/symptoms/:path*',
    '/insights/:path*',
    '/community/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/auth/:path*',
  ],
}
