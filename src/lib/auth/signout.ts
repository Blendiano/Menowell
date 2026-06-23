import { redirect } from 'next/navigation'

export const signOut = async (options?: { redirectTo?: string }) => {
  redirect(options?.redirectTo ? `/api/auth/signout?callbackUrl=${encodeURIComponent(options.redirectTo)}` : '/api/auth/signout')
}
