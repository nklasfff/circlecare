import { useState } from 'react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import type { Task } from '@/types/database'
import type { MemberView } from '@/data/types'
import { Card } from '@/components/ui/Card'
import {
  useFamilyId,
  useMembers,
  useTasks,
  useTaskMutations,
} from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'
import { isCoordinator } from '@/features/identity/roles'
import { categoryIcon, categoryLabel } from './categories'
import { AddTaskForm } from './AddTaskForm'

type Filter = 'mine' | 'all'

export function TasksScreen() {
  const { data: familyId } = useFamilyId()
  const { data: members } = useMembers(familyId)
  const { data: tasks, isLoading, isError } = useTasks(familyId)
  const { member } = useActiveMember()

  // Rolle-ansvarlige starter på "Mine"; koordinator/omsorgsmodtager på "Alle".
  const [override, setOverride] = useState<Filter | null>(null)
  const defaultFilter: Filter =
    member && !isCoordinator(member) && !member.isCareRecipient ? 'mine' : 'all'
  const filter = override ?? defaultFilter

  const all = tasks ?? []
  const visible =
    filter === 'mine'
      ? all.filter((t) => t.assigned_to === member?.membershipId)
      : all
  const openCount = visible.filter((t) => t.status !== 'done').length

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">Opgaver</h1>
        <p className="mt-1 text-muted">
          {openCount === 0
            ? 'Alt er klaret 🎉'
            : `${openCount} ${openCount === 1 ? 'opgave' : 'opgaver'} at gøre`}
        </p>
      </header>

      <div className="mb-5 flex gap-2">
        <FilterTab active={filter === 'mine'} onClick={() => setOverride('mine')}>
          Mine
        </FilterTab>
        <FilterTab active={filter === 'all'} onClick={() => setOverride('all')}>
          Alle
        </FilterTab>
      </div>

      {familyId && members && (
        <AddTaskForm familyId={familyId} members={members} />
      )}

      {isLoading && <p className="text-muted">Henter opgaver…</p>}
      {isError && <p className="text-danger">Kunne ikke hente opgaver.</p>}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {visible.length === 0 ? (
            <Card>
              <p className="text-muted">
                {filter === 'mine'
                  ? 'Du har ingen opgaver lige nu.'
                  : 'Ingen opgaver endnu.'}
              </p>
            </Card>
          ) : (
            visible.map((task) => (
              <TaskRow key={task.id} task={task} members={members ?? []} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl px-4 py-2 font-semibold transition ${
        active ? 'bg-primary text-white' : 'bg-surface text-primary'
      }`}
    >
      {children}
    </button>
  )
}

function TaskRow({ task, members }: { task: Task; members: MemberView[] }) {
  const { update, remove } = useTaskMutations()
  const done = task.status === 'done'
  const when = task.due_at
    ? format(new Date(task.due_at), 'EEEE d. MMM · HH:mm', { locale: da })
    : 'Uden tidspunkt'

  return (
    <Card
      accent={done ? '#34c759' : task.assigned_to ? undefined : '#ff3b30'}
      className={done ? 'opacity-60' : ''}
    >
      <div className="flex items-center gap-3">
        <button
          aria-label={done ? 'Markér som ikke klaret' : 'Markér som klaret'}
          onClick={() =>
            update.mutate({
              id: task.id,
              patch: { status: done ? 'todo' : 'done' },
            })
          }
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-base transition ${
            done
              ? 'border-success bg-success text-white'
              : 'border-muted text-transparent'
          }`}
        >
          ✓
        </button>

        <span className="text-2xl">{categoryIcon(task.category)}</span>

        <div className="min-w-0 flex-1">
          <p className={`truncate font-semibold ${done ? 'line-through' : ''}`}>
            {task.title}
          </p>
          <p className="truncate text-sm capitalize text-muted">
            {when} · {categoryLabel(task.category)}
          </p>
        </div>

        <button
          aria-label="Slet opgave"
          onClick={() => remove.mutate(task.id)}
          className="shrink-0 px-1 text-lg text-muted transition active:scale-90"
        >
          ✕
        </button>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-muted">
        Ansvarlig
        <select
          value={task.assigned_to ?? ''}
          onChange={(e) =>
            update.mutate({
              id: task.id,
              patch: { assigned_to: e.target.value || null },
            })
          }
          className={`flex-1 rounded-xl bg-bg px-3 py-2 text-base outline-none focus:ring-2 focus:ring-primary ${
            task.assigned_to ? 'text-ink' : 'font-semibold text-danger'
          }`}
        >
          <option value="">Mangler ansvarlig</option>
          {members.map((m) => (
            <option key={m.membershipId} value={m.membershipId}>
              {m.displayName}
            </option>
          ))}
        </select>
      </label>
    </Card>
  )
}
