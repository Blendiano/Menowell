export const VALID_ROUTES = [
  '/',
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password/[token]',
  '/onboarding',
  '/dashboard',
  '/dashboard/symptoms',
  '/dashboard/symptoms/new',
  '/dashboard/insights',
  '/dashboard/learn',
  '/dashboard/notifications',
  '/dashboard/profile',
  '/dashboard/profile/edit',
  '/dashboard/community',
  '/dashboard/community/new',
  '/dashboard/community/[id]',
] as const

export type TRoute = (typeof VALID_ROUTES)[number]

export function isRouteValid(route: string): boolean {
  if (route.startsWith('/dashboard/community/') && !route.endsWith('/new')) {
    return true
  }
  return VALID_ROUTES.includes(route as TRoute)
}

export function logNavigation({
  from,
  to,
  ids,
  apiResponse,
}: {
  from?: string
  to: string
  ids?: Record<string, string | undefined>
  apiResponse?: unknown
}) {
  const missingIds = ids
    ? Object.entries(ids).filter(([, v]) => !v).map(([k]) => k)
    : []

  if (missingIds.length > 0) {
    console.error(`[Navigation] Missing required IDs before navigating to "${to}": ${missingIds.join(', ')}`)
  }

  if (!isRouteValid(to)) {
    console.error(`[Navigation] Attempting to navigate to potentially invalid route: "${to}"`, {
      from,
      ids,
      apiResponse,
    })
    return false
  }

  return true
}
