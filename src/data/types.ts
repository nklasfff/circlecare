import type {
  EventCategory,
  MemberRole,
  Relation,
  TaskCategory,
  TaskStatus,
} from '@/types/database'

export type { CoverageItem } from '@/types/database'

/** Felter til at oprette en ny opgave. */
export interface NewTaskInput {
  family_id: string
  title: string
  category: TaskCategory
  assigned_to: string | null
  due_at: string | null
}

/** Felter der kan opdateres på en opgave. */
export interface TaskPatch {
  title?: string
  category?: TaskCategory
  assigned_to?: string | null
  due_at?: string | null
  status?: TaskStatus
}

/** Felter til at oprette en ny kalender-begivenhed. */
export interface NewEventInput {
  family_id: string
  title: string
  location: string | null
  starts_at: string
  ends_at: string | null
  category: EventCategory
  covered_by: string | null
}

/** Felter der kan opdateres på en begivenhed. */
export interface EventPatch {
  title?: string
  location?: string | null
  starts_at?: string
  ends_at?: string | null
  category?: EventCategory
  covered_by?: string | null
}

/** Et familiemedlem klar til visning (navn + roller samlet). */
export interface MemberView {
  membershipId: string
  profileId: string | null
  relation: Relation
  isCareRecipient: boolean
  displayName: string
  avatarColor: string | null
  roles: MemberRole[]
}
