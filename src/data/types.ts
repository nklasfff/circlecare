import type { MemberRole, Relation } from '@/types/database'

export type { CoverageItem } from '@/types/database'

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
