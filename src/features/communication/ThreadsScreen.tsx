import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { da } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, MessageSquare, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/icons'
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
    <div className="mx-auto max-w-md px-5 pb-28 pt-7">
      <Link to="/beskeder" className="mb-4 flex items-center gap-1 text-slate">
        <ChevronLeft size={22} strokeWidth={1.5} /> Beskeder
      </Link>
      <header className="mb-6">
        <p className="eyebrow">Emner</p>
        <h1 className="font-display mt-2 text-[2rem] leading-tight text-ink">
          {track?.name ?? 'Samtale'}
        </h1>
      </header>

      {open ? (
        <form onSubmit={handleCreate} className="glass mb-5 space-y-3 p-4">
          <input
            autoFocus
            placeholder="Hvad handler det om?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl bg-white/55 px-4 py-3 text-lg text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-slate"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setTitle('')
                setOpen(false)
              }}
              className="btn-ghost flex-1 px-4 py-3 font-semibold"
            >
              Annullér
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createThread.isPending}
              className="btn-soft flex-1 px-4 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-60"
            >
              {createThread.isPending ? 'Opretter…' : 'Opret emne'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="btn-soft mb-5 flex w-full items-center justify-center gap-2 px-4 py-3.5 text-base font-semibold transition active:scale-[0.99]"
        >
          <Plus size={20} strokeWidth={1.5} /> Nyt emne
        </button>
      )}

      {isLoading && <p className="text-muted">Henter emner…</p>}
      {isError && <p className="text-[#B23A3A]">Kunne ikke hente emner.</p>}

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
                  <div className="flex items-center gap-3.5">
                    <Icon as={MessageSquare} className="text-steel" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {thread.title}
                      </p>
                      <p className="text-sm text-muted">
                        Aktiv for{' '}
                        {formatDistanceToNow(new Date(thread.last_activity_at), {
                          locale: da,
                        })}{' '}
                        siden
                      </p>
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
