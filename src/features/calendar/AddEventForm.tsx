import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import type { EventCategory } from '@/types/database'
import type { MemberView } from '@/data/types'
import { useEventMutations } from '@/data/hooks'
import { EVENT_CATEGORIES } from './categories'

interface Props {
  familyId: string
  members: MemberView[]
  defaultDay: Date
}

export function AddEventForm({ familyId, members, defaultDay }: Props) {
  const [open, setOpen] = useState(false)
  const { create } = useEventMutations()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<EventCategory>('visit')
  const [coveredBy, setCoveredBy] = useState('')
  const [when, setWhen] = useState(
    format(defaultDay, "yyyy-MM-dd'T'10:00"),
  )

  function reset() {
    setTitle('')
    setLocation('')
    setCategory('visit')
    setCoveredBy('')
    setWhen(format(defaultDay, "yyyy-MM-dd'T'10:00"))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !when) return
    await create.mutateAsync({
      family_id: familyId,
      title: title.trim(),
      location: location.trim() || null,
      starts_at: new Date(when).toISOString(),
      ends_at: null,
      category,
      covered_by: coveredBy || null,
    })
    reset()
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-5 w-full rounded-2xl bg-primary px-4 py-4 text-lg font-semibold text-white transition active:scale-[0.98]"
      >
        + Tilføj aftale
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 space-y-3 rounded-2xl bg-surface p-4 shadow-sm"
    >
      <input
        autoFocus
        placeholder="Hvad sker der?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl bg-bg px-4 py-3 text-lg outline-none placeholder:text-muted focus:ring-2 focus:ring-primary"
      />
      <input
        placeholder="Hvor? (valgfrit)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full rounded-xl bg-bg px-4 py-3 text-base outline-none placeholder:text-muted focus:ring-2 focus:ring-primary"
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-muted">
          Type
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className="mt-1 w-full rounded-xl bg-bg px-3 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-primary"
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-muted">
          Hvem dækker
          <select
            value={coveredBy}
            onChange={(e) => setCoveredBy(e.target.value)}
            className="mt-1 w-full rounded-xl bg-bg px-3 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Ingen endnu</option>
            {members.map((m) => (
              <option key={m.membershipId} value={m.membershipId}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm text-muted">
        Hvornår
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="mt-1 w-full rounded-xl bg-bg px-3 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            reset()
            setOpen(false)
          }}
          className="flex-1 rounded-xl bg-bg px-4 py-3 font-semibold text-primary"
        >
          Annullér
        </button>
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {create.isPending ? 'Gemmer…' : 'Gem aftale'}
        </button>
      </div>
    </form>
  )
}
