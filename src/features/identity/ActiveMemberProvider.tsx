import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useFamilyId, useMembers } from '@/data/hooks'
import type { MemberView } from '@/data/types'

const STORAGE_KEY = 'cc-active-member'

interface Ctx {
  activeId: string | null
  setActiveId: (id: string) => void
}

const ActiveMemberContext = createContext<Ctx | undefined>(undefined)

/**
 * Holder styr på hvilket familiemedlem appen vises "som". Indtil login findes,
 * vælges perspektivet manuelt i top-baren. Når Supabase-auth kommer, vil den
 * indloggede brugers membership bare sætte activeId i stedet — resten af appen
 * (rolle-tilpassede visninger) er allerede bygget op om dette.
 */
export function ActiveMemberProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

  const setActiveId = (id: string) => {
    setActiveIdState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // ignorér (fx privat browsing)
    }
  }

  const value = useMemo(() => ({ activeId, setActiveId }), [activeId])

  return (
    <ActiveMemberContext.Provider value={value}>
      {children}
    </ActiveMemberContext.Provider>
  )
}

/**
 * Det aktive medlem (med fallback til koordinatoren) samt familiens medlemmer.
 * Sætter automatisk et standard-perspektiv første gang medlemmerne er hentet.
 */
export function useActiveMember(): {
  member: MemberView | undefined
  members: MemberView[]
  setActiveId: (id: string) => void
} {
  const ctx = useContext(ActiveMemberContext)
  if (!ctx) throw new Error('useActiveMember skal bruges inde i ActiveMemberProvider')
  const { activeId, setActiveId } = ctx

  const { data: familyId } = useFamilyId()
  const { data: members } = useMembers(familyId)

  const member = useMemo(() => {
    if (!members?.length) return undefined
    return (
      members.find((m) => m.membershipId === activeId) ??
      members.find((m) => m.roles.includes('coordinator')) ??
      members[0]
    )
  }, [members, activeId])

  useEffect(() => {
    if (member && member.membershipId !== activeId) setActiveId(member.membershipId)
  }, [member, activeId, setActiveId])

  return { member, members: members ?? [], setActiveId }
}
