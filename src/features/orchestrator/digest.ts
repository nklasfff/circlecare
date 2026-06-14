import { differenceInCalendarDays } from 'date-fns'
import type { CoverageItem, Thread } from '@/types/database'

/** En beslutning regnes for "hængende", når en åben tråd ikke har haft
 *  aktivitet i mindst så mange dage. */
export const STALE_DAYS = 3

export interface WeekSummary {
  planned: number
  covered: number
  uncovered: number
  done: number
}

export function summarize(items: CoverageItem[]): WeekSummary {
  return {
    planned: items.length,
    covered: items.filter((i) => !i.uncovered).length,
    uncovered: items.filter((i) => i.uncovered).length,
    done: items.filter((i) => i.status === 'done').length,
  }
}

export interface PendingDecision {
  thread: Thread
  daysStale: number
}

/** Åbne tråde uden aktivitet i ≥ STALE_DAYS dage, ældst først. */
export function pendingDecisions(
  threads: Thread[],
  now: Date = new Date(),
): PendingDecision[] {
  return threads
    .filter((t) => t.status === 'open')
    .map((t) => ({
      thread: t,
      daysStale: differenceInCalendarDays(now, new Date(t.last_activity_at)),
    }))
    .filter((p) => p.daysStale >= STALE_DAYS)
    .sort((a, b) => b.daysStale - a.daysStale)
}
