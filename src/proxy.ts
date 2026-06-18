import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  try {
    const session = await auth()
    const { pathname } = request.nextUrl

    const isAuthPage = pathname.startsWith('/auth')
    const isProtected =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/onboarding') ||
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
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/community/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/auth/:path*',
  ],
}
