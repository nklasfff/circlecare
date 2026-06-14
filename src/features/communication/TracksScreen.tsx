import { Link } from 'react-router-dom'
import { Users, UserRound, Baby, ChevronRight, type LucideIcon } from 'lucide-react'
import type { TrackKind } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/icons'
import { useFamilyId, useTracks, useFamilyThreads } from '@/data/hooks'
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
  const { data: threads } = useFamilyThreads(familyId)
  const { member } = useActiveMember()

  const visible = (tracks ?? []).filter(
    (t) => !member || memberInTrack(member, t.kind),
  )

  function topicCount(trackId: string): number {
    return (threads ?? []).filter((t) => t.track_id === trackId).length
  }

  return (
    <div className="mx-auto w-full max-w-[700px] px-5 pb-28 pt-7">
      <header className="enter mb-8">
        <p className="eyebrow">Beskeder</p>
        <h1 className="font-display mt-3 text-[2.4rem] leading-[1.1] text-ink">
          Hold <span className="text-accent">forbindelsen</span>.
        </h1>
      </header>

      {isLoading && <p className="text-muted">Henter samtaler…</p>}
      {isError && <p className="text-[#B23A3A]">Kunne ikke hente samtaler.</p>}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {visible.length === 0 ? (
            <p className="py-6 text-center italic text-muted">
              Du er ikke med i nogen samtaler endnu.
            </p>
          ) : (
            visible.map((track) => {
              const count = topicCount(track.id)
              return (
                <Link key={track.id} to={`/beskeder/${track.id}`}>
                  <Card onClick={() => {}}>
                    <div className="flex items-center gap-4">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'rgba(60,78,134,.12)' }}
                      >
                        <Icon as={TRACK_ICON[track.kind]} className="text-[#3C4E86]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[17px] font-medium text-ink">
                          {track.name}
                        </p>
                        <p className="text-[12px] text-muted">
                          {count === 0
                            ? 'Ingen emner endnu'
                            : `${count} ${count === 1 ? 'emne' : 'emner'}`}
                        </p>
                      </div>
                      {count > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate px-1.5 text-xs font-semibold text-white">
                          {count}
                        </span>
                      )}
                      <ChevronRight size={20} strokeWidth={1.5} className="text-steel/60" />
                    </div>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
