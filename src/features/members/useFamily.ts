import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { fetchMembers, fetchMyFamilyId, type MemberView } from './api'

export function useFamilyId() {
  const { session } = useAuth()
  const userId = session?.user.id
  return useQuery({
    queryKey: ['family-id', userId],
    enabled: Boolean(userId),
    queryFn: () => fetchMyFamilyId(userId as string),
  })
}

export function useMembers(familyId: string | null | undefined) {
  return useQuery({
    queryKey: ['members', familyId],
    enabled: Boolean(familyId),
    queryFn: () => fetchMembers(familyId as string),
  })
}

/** Slå et medlems-navn op ud fra membership-id. */
export function memberName(
  members: MemberView[] | undefined,
  membershipId: string | null,
): string | null {
  if (!membershipId || !members) return null
  return members.find((m) => m.membershipId === membershipId)?.displayName ?? null
}
