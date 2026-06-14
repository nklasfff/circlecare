import type {
  EventCategory,
  MemberRole,
  Relation,
  TaskCategory,
} from '@/types/database'
import type { MemberView } from '@/data/types'

export function roleLabel(role: MemberRole): string {
  const map: Record<MemberRole, string> = {
    coordinator: 'Koordinator',
    food: 'Mad',
    doctor: 'Læge',
    transport: 'Transport',
  }
  return map[role]
}

export function relationLabel(relation: Relation): string {
  const map: Record<Relation, string> = {
    father: 'Far',
    mother: 'Mor',
    son: 'Søn',
    daughter: 'Datter',
    grandchild: 'Barnebarn',
  }
  return map[relation]
}

/** Kort beskrivelse af et medlems "kasket" til top-baren. */
export function memberSubtitle(member: MemberView): string {
  if (member.roles.length) return member.roles.map(roleLabel).join(' · ')
  if (member.isCareRecipient) return `${relationLabel(member.relation)} · modtager omsorg`
  return relationLabel(member.relation)
}

export function isCoordinator(member: MemberView): boolean {
  return member.roles.includes('coordinator')
}

/** Hvilke opgave-kategorier en rolle har et særligt ansvar for. */
const ROLE_TASK_CATEGORIES: Record<MemberRole, TaskCategory[]> = {
  coordinator: ['medicine', 'food', 'transport', 'appointment', 'other'],
  food: ['food'],
  doctor: ['medicine', 'appointment'],
  transport: ['transport'],
}

/** Hvilke begivenheds-kategorier en rolle har et særligt ansvar for. */
const ROLE_EVENT_CATEGORIES: Record<MemberRole, EventCategory[]> = {
  coordinator: ['visit', 'medical', 'meal', 'transport', 'other'],
  food: ['meal'],
  doctor: ['medical'],
  transport: ['transport'],
}

/** Er en dæknings-kategori særligt relevant for medlemmets rolle(r)? */
export function matchesRole(member: MemberView, category: string): boolean {
  return member.roles.some(
    (r) =>
      (ROLE_TASK_CATEGORIES[r] as string[]).includes(category) ||
      (ROLE_EVENT_CATEGORIES[r] as string[]).includes(category),
  )
}
