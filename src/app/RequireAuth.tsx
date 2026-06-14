import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { LoginScreen } from '@/features/auth/LoginScreen'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        Indlæser…
      </div>
    )
  }

  if (!session) return <LoginScreen />

  return <>{children}</>
}
