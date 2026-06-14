import { useState, type FormEvent } from 'react'
import type { TaskCategory } from '@/types/database'
import type { MemberView } from '@/data/types'
import { useTaskMutations } from '@/data/hooks'
import { TASK_CATEGORIES } from './categories'

interface Props {
  familyId: string
  members: MemberView[]
}

export function AddTaskForm({ familyId, members }: Props) {
  const [open, setOpen] = useState(false)
  const { create } = useTaskMutations()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TaskCategory>('other')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [date, setDate] = useState('')

  function reset() {
    setTitle('')
    setCategory('other')
    setAssignedTo('')
    setDate('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await create.mutateAsync({
      family_id: familyId,
      title: title.trim(),
      category,
      assigned_to: assignedTo || null,
      due_at: date ? new Date(date).toISOString() : null,
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
        + Tilføj opgave
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
        placeholder="Hvad skal gøres?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl bg-bg px-4 py-3 text-lg outline-none placeholder:text-muted focus:ring-2 focus:ring-primary"
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-muted">
          Kategori
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="mt-1 w-full rounded-xl bg-bg px-3 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-primary"
          >
            {TASK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-muted">
          Ansvarlig
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
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
        Hvornår (valgfrit)
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
          {create.isPending ? 'Gemmer…' : 'Gem opgave'}
        </button>
      </div>
    </form>
  )
}
