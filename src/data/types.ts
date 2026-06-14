import type { MemberRole, Relation, TaskCategory, TaskStatus } from '@/types/database'

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
