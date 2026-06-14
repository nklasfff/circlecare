import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { startOfWeek, endOfWeek } from 'date-fns'
import { useDataSource } from './DataProvider'
import type { MemberView } from './types'

export function useFamilyId() {
  const ds = useDataSource()
  return useQuery({
    queryKey: ['family-id'],
    queryFn: () => ds.getCurrentFamilyId(),
  })
}

export function useMembers(familyId: string | null | undefined) {
  const ds = useDataSource()
  return useQuery({
    queryKey: ['members', familyId],
    enabled: Boolean(familyId),
    queryFn: () => ds.getMembers(familyId as string),
  })
}

/**
 * Dækningsbilledet for den indeværende uge (mandag–søndag), med live-opdatering
 * via data-kildens subscribe (mock i dag, realtime senere).
 */
export function useWeekCoverage(familyId: string | null | undefined) {
  const ds = useDataSource()
  const now = new Date()
  const from = startOfWeek(now, { weekStartsOn: 1 })
  const to = endOfWeek(now, { weekStartsOn: 1 })

  const query = useQuery({
    queryKey: ['coverage', familyId, from.toISOString().slice(0, 10)],
    enabled: Boolean(familyId),
    queryFn: () =>
      ds.getCoverage(familyId as string, from.toISOString(), to.toISOString()),
  })

  const { refetch } = query
  useEffect(() => {
    if (!familyId) return
    return ds.subscribe(familyId, () => {
      void refetch()
    })
  }, [ds, familyId, refetch])

  return { ...query, weekStart: from, weekEnd: to }
}

/** Slå et medlems-navn op ud fra membership-id. */
export function memberName(
  members: MemberView[] | undefined,
  membershipId: string | null,
): string | null {
  if (!membershipId || !members) return null
  return members.find((m) => m.membershipId === membershipId)?.displayName ?? null
}
