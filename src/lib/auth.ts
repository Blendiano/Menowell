import NextAuth, { type NextAuthOptions, getServerSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { redirect } from 'next/navigation'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { prisma } = await import('@/lib/prisma')
        const bcrypt = await import('bcryptjs')
        const { z } = await import('zod')

        const { email, password } = credentials as { email: string; password: string }

        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse({ email, password })

        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user || !user.email || !user.passwordHash) return null

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: any) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }: any) {
      if (token.id && session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

export const auth = () => getServerSession(authOptions)
export const signIn = async () => {}
export const signOut = async (options?: { redirectTo?: string }) => {
  redirect(options?.redirectTo ? `/api/auth/signout?callbackUrl=${encodeURIComponent(options.redirectTo)}` : '/api/auth/signout')
}
