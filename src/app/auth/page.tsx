import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'

type TAuthPageProps = {
  searchParams: Promise<{ mode?: string; registered?: string }>
}

export default async function AuthPage({ searchParams }: TAuthPageProps) {
  const { mode, registered } = await searchParams

  if (mode === 'register') {
    return (
      <AuthCard heading="Create your account" subtitle="Track symptoms. Gain clarity. Feel supported.">
        <RegisterForm />
      </AuthCard>
    )
  }

  return (
    <AuthCard heading="Welcome back">
      <LoginForm registered={registered === '1'} />
    </AuthCard>
  )
}
