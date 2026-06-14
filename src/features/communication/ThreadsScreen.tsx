import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { da } from 'date-fns/locale'
import { Card } from '@/components/ui/Card'
import {
  useFamilyId,
  useTracks,
  useThreads,
  useCommunicationMutations,
} from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'

export function ThreadsScreen() {
  const { trackId } = useParams()
  const { data: familyId } = useFamilyId()
  const { data: tracks } = useTracks(familyId)
  const { data: threads, isLoading, isError } = useThreads(familyId, trackId)
  const { member } = useActiveMember()
  const { createThread } = useCommunicationMutations()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const track = tracks?.find((t) => t.id === trackId)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !trackId) return
    await createThread.mutateAsync({
      track_id: trackId,
      title: title.trim(),
      created_by: member?.membershipId ?? null,
    })
    setTitle('')
    setOpen(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <Link to="/beskeder" className="mb-4 flex items-center text-primary">
        <span className="mr-1 text-2xl">‹</span> Beskeder
      </Link>
      <header className="mb-5">
        <h1 className="text-3xl font-bold">{track?.name ?? 'Samtale'}</h1>
        <p className="mt-1 text-muted">Emner</p>
      </header>

      {open ? (
        <form
          onSubmit={handleCreate}
          className="mb-5 space-y-3 rounded-2xl bg-surface p-4 shadow-sm"
        >
          <input
            autoFocus
            placeholder="Hvad handler det om?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl bg-bg px-4 py-3 text-lg outline-none placeholder:text-muted focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setTitle('')
                setOpen(false)
              }}
              className="flex-1 rounded-xl bg-bg px-4 py-3 font-semibold text-primary"
            >
              Annullér
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createThread.isPending}
              className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {createThread.isPending ? 'Opretter…' : 'Opret emne'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mb-5 w-full rounded-2xl bg-primary px-4 py-4 text-lg font-semibold text-white transition active:scale-[0.98]"
        >
          + Nyt emne
        </button>
      )}

      {isLoading && <p className="text-muted">Henter emner…</p>}
      {isError && <p className="text-danger">Kunne ikke hente emner.</p>}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {(threads ?? []).length === 0 ? (
            <Card>
              <p className="text-muted">Ingen emner endnu. Start et nyt.</p>
            </Card>
          ) : (
            (threads ?? []).map((thread) => (
              <Link key={thread.id} to={`/beskeder/${trackId}/${thread.id}`}>
                <Card onClick={() => {}}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{thread.title}</p>
                      <p className="text-sm text-muted">
                        Aktiv for{' '}
                        {formatDistanceToNow(new Date(thread.last_activity_at), {
                          locale: da,
                        })}{' '}
                        siden
                      </p>
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
