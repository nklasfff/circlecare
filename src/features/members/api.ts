import { supabase } from '@/lib/supabase'
import type {
  MemberRole,
  Membership,
  Profile,
  Relation,
} from '@/types/database'

export interface MemberView {
  membershipId: string
  profileId: string | null
  relation: Relation
  isCareRecipient: boolean
  displayName: string
  avatarColor: string | null
  roles: MemberRole[]
}

interface MembershipJoin extends Membership {
  profiles: Pick<Profile, 'display_name' | 'avatar_color'> | null
  member_roles: { role: MemberRole }[]
}

/** Finder den familie, den indloggede bruger er medlem af. */
export async function fetchMyFamilyId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('memberships')
    .select('family_id')
    .eq('profile_id', userId)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.family_id ?? null
}

/** Henter alle medlemmer (med roller + profil) i en familie. */
export async function fetchMembers(familyId: string): Promise<MemberView[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select(
      'id, family_id, profile_id, label, relation, is_care_recipient, created_at, profiles(display_name, avatar_color), member_roles(role)',
    )
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
  if (error) throw error

  return (data as unknown as MembershipJoin[]).map((m) => ({
    membershipId: m.id,
    profileId: m.profile_id,
    relation: m.relation,
    isCareRecipient: m.is_care_recipient,
    displayName: m.profiles?.display_name ?? m.label ?? fallbackName(m.relation),
    avatarColor: m.profiles?.avatar_color ?? null,
    roles: m.member_roles.map((r) => r.role),
  }))
}

function fallbackName(relation: Relation): string {
  const map: Record<Relation, string> = {
    father: 'Far',
    mother: 'Mor',
    son: 'Søn',
    daughter: 'Datter',
    grandchild: 'Barnebarn',
  }
  return map[relation]
}
