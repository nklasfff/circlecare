import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronLeft, SendHorizontal } from 'lucide-react'
import {
  useFamilyId,
  useMembers,
  useThreads,
  useMessages,
  useCommunicationMutations,
  memberName,
} from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'

export function ThreadScreen() {
  const { trackId, threadId } = useParams()
  const { data: familyId } = useFamilyId()
  const { data: members } = useMembers(familyId)
  const { data: threads } = useThreads(familyId, trackId)
  const { data: messages, isLoading, isError } = useMessages(familyId, threadId)
  const { member } = useActiveMember()
  const { sendMessage } = useCommunicationMutations()

  const [body, setBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const thread = threads?.find((t) => t.id === threadId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!body.trim() || !threadId) return
    await sendMessage.mutateAsync({
      thread_id: threadId,
      author: member?.membershipId ?? null,
      body: body.trim(),
    })
    setBody('')
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-5 pt-7">
      <Link
        to={`/beskeder/${trackId}`}
        className="mb-3 flex items-center gap-1 text-slate"
      >
        <ChevronLeft size={22} strokeWidth={1.5} /> Tilbage
      </Link>
      <h1 className="font-display mb-4 text-2xl text-ink">
        {thread?.title ?? 'Emne'}
      </h1>

      {isLoading && <p className="text-muted">Henter beskeder…</p>}
      {isError && <p className="text-[#B23A3A]">Kunne ikke hente beskeder.</p>}

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {(messages ?? []).map((msg) => {
          const mine = msg.author === member?.membershipId
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
            >
              {!mine && (
                <span className="mb-0.5 ml-1 text-xs font-semibold text-muted">
                  {memberName(members, msg.author) ?? 'Ukendt'}
                </span>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 ${
                  mine
                    ? 'rounded-2xl bg-slate text-white'
                    : 'glass rounded-2xl text-ink'
                }`}
              >
                {msg.body}
              </div>
              <span className="mt-0.5 px-1 text-[11px] text-muted">
                {format(new Date(msg.created_at), 'HH:mm')}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="sticky bottom-0 flex gap-2 py-3">
        <input
          placeholder="Skriv en besked…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="glass flex-1 rounded-full px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-slate"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!body.trim() || sendMessage.isPending}
          className="btn-soft flex h-12 w-12 shrink-0 items-center justify-center transition active:scale-95 disabled:opacity-50"
        >
          <SendHorizontal size={20} strokeWidth={1.5} />
        </button>
      </form>
    </div>
  )
}
