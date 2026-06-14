import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { startOfWeek, endOfWeek } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { fetchCoverage } from './api'

/**
 * Dækningsbilledet for den indeværende uge (mandag–søndag), med live-synk:
 * når en opgave eller begivenhed ændres af et andet familiemedlem, hentes
 * dækningsposterne automatisk igen.
 */
export function useWeekCoverage(familyId: string | null | undefined) {
  const queryClient = useQueryClient()

  const now = new Date()
  const from = startOfWeek(now, { weekStartsOn: 1 })
  const to = endOfWeek(now, { weekStartsOn: 1 })

  const query = useQuery({
    queryKey: ['coverage', familyId, from.toISOString().slice(0, 10)],
    enabled: Boolean(familyId),
    queryFn: () =>
      fetchCoverage(familyId as string, from.toISOString(), to.toISOString()),
  })

  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel(`coverage:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `family_id=eq.${familyId}`,
        },
        () => query.refetch(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `family_id=eq.${familyId}`,
        },
        () => query.refetch(),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId, queryClient])

  return { ...query, weekStart: from, weekEnd: to }
}
