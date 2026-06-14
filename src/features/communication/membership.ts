import type { TrackKind } from '@/types/database'
import type { MemberView } from '@/data/types'

/**
 * Hvilke spor et medlem er en del af, afledt af deres relation. Spejler
 * track_members-logikken i supabase/seed.sql. Når login og en rigtig database
 * kommer, vil medlemskabet i stedet komme fra databasen.
 */
export function memberInTrack(member: MemberView, kind: TrackKind): boolean {
  const r = member.relation
  switch (kind) {
    case 'siblings':
      return r === 'son' || r === 'daughter'
    case 'with_parent':
      return r === 'son' || r === 'daughter' || r === 'father'
    case 'with_grandchildren':
      return r === 'son' || r === 'daughter' || r === 'grandchild'
  }
}
