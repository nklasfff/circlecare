import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { DataProvider } from '@/data/DataProvider'
import { ActiveMemberProvider } from '@/features/identity/ActiveMemberProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <ActiveMemberProvider>{children}</ActiveMemberProvider>
      </DataProvider>
    </QueryClientProvider>
  )
}
