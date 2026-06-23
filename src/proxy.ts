import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    })

    const { pathname } = request.nextUrl

    const isAuthPage = pathname.startsWith('/auth')
    const isProtected =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/community') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/notifications')

    if (isProtected && !token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Proxy auth error:', error)
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
