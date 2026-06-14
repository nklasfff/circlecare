import { Link } from 'react-router-dom'
import type { TrackKind } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { useFamilyId, useTracks } from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'
import { memberInTrack } from './membership'

const TRACK_ICON: Record<TrackKind, string> = {
  siblings: '👨‍👩‍👧‍👦',
  with_parent: '👴',
  with_grandchildren: '🧒',
}

export function TracksScreen() {
  const { data: familyId } = useFamilyId()
  const { data: tracks, isLoading, isError } = useTracks(familyId)
  const { member } = useActiveMember()

  const visible = (tracks ?? []).filter(
    (t) => !member || memberInTrack(member, t.kind),
  )

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <header className="mb-5">
        <h1 className="text-3xl font-bold">Beskeder</h1>
        <p className="mt-1 text-muted">Vælg en samtale</p>
      </header>

      {isLoading && <p className="text-muted">Henter samtaler…</p>}
      {isError && <p className="text-danger">Kunne ikke hente samtaler.</p>}

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
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{TRACK_ICON[track.kind]}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{track.name}</p>
                      <p className="text-sm text-muted">Åbn emner og beskeder</p>
                    </div>
                    <span className="text-xl text-muted">›</span>
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
