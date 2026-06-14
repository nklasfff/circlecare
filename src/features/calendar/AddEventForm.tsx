import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import type { EventCategory } from '@/types/database'
import type { MemberView } from '@/data/types'
import { useEventMutations } from '@/data/hooks'
import { EVENT_CATEGORIES } from './categories'

interface Props {
  familyId: string
  members: MemberView[]
  defaultDay: Date
}

const inputClass =
  'w-full rounded-xl bg-white/55 px-3 py-3 text-base text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-slate'

export function AddEventForm({ familyId, members, defaultDay }: Props) {
  const [open, setOpen] = useState(false)
  const { create } = useEventMutations()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<EventCategory>('visit')
  const [coveredBy, setCoveredBy] = useState('')
  const [when, setWhen] = useState(format(defaultDay, "yyyy-MM-dd'T'10:00"))

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
        className="btn-soft mb-5 flex w-full items-center justify-center gap-2 px-4 py-3.5 text-base font-semibold transition active:scale-[0.99]"
      >
        <Plus size={20} strokeWidth={1.5} /> Tilføj aftale
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass mb-5 space-y-3 p-4">
      <input
        autoFocus
        placeholder="Hvad sker der?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={`${inputClass} text-lg`}
      />
      <input
        placeholder="Hvor? (valgfrit)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className={inputClass}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-muted">
          Type
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className={`mt-1 ${inputClass}`}
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-muted">
          Hvem dækker
          <select
            value={coveredBy}
            onChange={(e) => setCoveredBy(e.target.value)}
            className={`mt-1 ${inputClass}`}
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
          className={`mt-1 ${inputClass}`}
        />
      </label>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            reset()
            setOpen(false)
          }}
          className="btn-ghost flex-1 px-4 py-3 font-semibold"
        >
          Annullér
        </button>
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="btn-soft flex-1 px-4 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-60"
        >
          {create.isPending ? 'Gemmer…' : 'Gem aftale'}
        </button>
      </div>
    </form>
  )
}
