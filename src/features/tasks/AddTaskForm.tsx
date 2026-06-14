import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import type { TaskCategory } from '@/types/database'
import type { MemberView } from '@/data/types'
import { useTaskMutations } from '@/data/hooks'
import { TASK_CATEGORIES } from './categories'

interface Props {
  familyId: string
  members: MemberView[]
}

const inputClass =
  'w-full rounded-xl bg-white/55 px-3 py-3 text-base text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-slate'

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
        className="hoverable mb-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#3C4E86]/70 p-4 text-base font-semibold text-[#3C4E86] active:scale-[0.99]"
      >
        <Plus size={20} strokeWidth={1.5} /> Tilføj opgave
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass mb-5 space-y-3 p-4">
      <input
        autoFocus
        placeholder="Hvad skal gøres?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={`${inputClass} text-lg`}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-muted">
          Kategori
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className={`mt-1 ${inputClass}`}
          >
            {TASK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-muted">
          Ansvarlig
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
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
        Hvornår (valgfrit)
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
          {create.isPending ? 'Gemmer…' : 'Gem opgave'}
        </button>
      </div>
    </form>
  )
}
