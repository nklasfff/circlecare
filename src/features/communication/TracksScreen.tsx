import { Link } from 'react-router-dom'
import { Users, UserRound, Baby, ChevronRight, type LucideIcon } from 'lucide-react'
import type { TrackKind } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/icons'
import { useFamilyId, useTracks } from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'
import { memberInTrack } from './membership'

const TRACK_ICON: Record<TrackKind, LucideIcon> = {
  siblings: Users,
  with_parent: UserRound,
  with_grandchildren: Baby,
}

export function TracksScreen() {
  const { data: familyId } = useFamilyId()
  const { data: tracks, isLoading, isError } = useTracks(familyId)
  const { member } = useActiveMember()

  const visible = (tracks ?? []).filter(
    (t) => !member || memberInTrack(member, t.kind),
  )

  return (
    <div className="mx-auto w-full max-w-[700px] px-5 pb-28 pt-7">
      <header className="enter mb-6">
        <p className="eyebrow">Beskeder</p>
        <h1 className="font-display mt-2 text-[2rem] leading-tight text-ink">
          Hold <span className="text-accent">forbindelsen</span>.
        </h1>
      </header>

      {isLoading && <p className="text-muted">Henter samtaler…</p>}
      {isError && <p className="text-[#B23A3A]">Kunne ikke hente samtaler.</p>}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {visible.length === 0 ? (
            <Card>
              <p className="text-muted">Du er ikke med i nogen samtaler endnu.</p>
            </Card>
          ) : (
            visible.map((track) => (
              <Link key={track.id} to={`/beskeder/${track.id}`}>
                <Card onClick={() => {}}>
                  <div className="flex items-center gap-3.5">
                    <Icon as={TRACK_ICON[track.kind]} className="text-steel" />
                    <div className="flex-1">
                      <p className="font-medium text-ink">{track.name}</p>
                      <p className="text-sm text-muted">Åbn emner og beskeder</p>
                    </div>
                    <ChevronRight size={20} strokeWidth={1.5} className="text-steel/60" />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
