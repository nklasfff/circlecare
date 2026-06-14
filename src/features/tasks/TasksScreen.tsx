import { useState } from 'react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import { Check, Trash2 } from 'lucide-react'
import type { Task } from '@/types/database'
import type { MemberView } from '@/data/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { CategoryIcon, Icon } from '@/components/ui/icons'
import {
  useFamilyId,
  useMembers,
  useTasks,
  useTaskMutations,
} from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'
import { isCoordinator } from '@/features/identity/roles'
import { categoryLabel } from './categories'
import { AddTaskForm } from './AddTaskForm'

type Filter = 'mine' | 'all'

export function TasksScreen() {
  const { data: familyId } = useFamilyId()
  const { data: members } = useMembers(familyId)
  const { data: tasks, isLoading, isError } = useTasks(familyId)
  const { member } = useActiveMember()

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
    <div className="mx-auto w-full max-w-[700px] px-5 pb-28 pt-7">
      <header className="enter mb-6">
        <p className="eyebrow">Opgaver</p>
        <h1 className="font-display mt-3 text-[2.4rem] leading-[1.1] text-ink">
          {openCount === 0 ? (
            'Alt er klaret.'
          ) : (
            <>
              <span className="text-accent">{openCount}</span>{' '}
              {openCount === 1 ? 'ting' : 'ting'} at gøre.
            </>
          )}
        </h1>
      </header>

      <div className="mb-5 flex gap-2">
        <Segment active={filter === 'mine'} onClick={() => setOverride('mine')}>
          Mine
        </Segment>
        <Segment active={filter === 'all'} onClick={() => setOverride('all')}>
          Alle
        </Segment>
      </div>

      {familyId && members && (
        <AddTaskForm familyId={familyId} members={members} />
      )}

      {isLoading && <p className="text-muted">Henter opgaver…</p>}
      {isError && <p className="text-[#B23A3A]">Kunne ikke hente opgaver.</p>}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {visible.length === 0 ? (
            <p className="py-6 text-center italic text-muted">
              {filter === 'mine'
                ? 'Du har ingen opgaver lige nu.'
                : 'Ingen opgaver endnu.'}
            </p>
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

function Segment({
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
      className={`hoverable flex-1 rounded-full px-4 py-2.5 text-sm font-semibold ${
        active ? 'bg-slate text-white' : 'btn-soft'
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
  const assignedName =
    members.find((m) => m.membershipId === task.assigned_to)?.displayName ?? null

  return (
    <Card className={done ? 'opacity-55' : ''}>
      <div className="flex items-center gap-3.5">
        <button
          aria-label={done ? 'Markér som ikke klaret' : 'Markér som klaret'}
          onClick={() =>
            update.mutate({
              id: task.id,
              patch: { status: done ? 'todo' : 'done' },
            })
          }
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            done ? 'border-slate bg-slate text-white' : 'border-steel/45 text-transparent'
          }`}
        >
          {done && <Check size={17} strokeWidth={2} className="check-pop" />}
        </button>

        <CategoryIcon category={task.category} className="text-steel" />

        <div className="min-w-0 flex-1">
          <p className={`truncate text-[17px] font-medium text-ink ${done ? 'line-through' : ''}`}>
            {task.title}
          </p>
          <p className="truncate text-[12px] capitalize text-muted">
            {when} · {categoryLabel(task.category)}
          </p>
        </div>

        <button
          aria-label="Slet opgave"
          onClick={() => remove.mutate(task.id)}
          className="shrink-0 text-steel/70 transition active:scale-90"
        >
          <Icon as={Trash2} size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        {task.assigned_to ? (
          <Avatar name={assignedName} size={28} />
        ) : (
          <span className="h-7 w-7 shrink-0 rounded-full border border-dashed border-[#3C4E86]/55" />
        )}
        <select
          aria-label="Ansvarlig"
          value={task.assigned_to ?? ''}
          onChange={(e) =>
            update.mutate({
              id: task.id,
              patch: { assigned_to: e.target.value || null },
            })
          }
          className={`cursor-pointer appearance-none bg-transparent text-[15px] outline-none ${
            task.assigned_to ? 'text-ink' : 'font-semibold text-[#3C4E86]'
          }`}
        >
          <option value="">Tilføj ansvarlig</option>
          {members.map((m) => (
            <option key={m.membershipId} value={m.membershipId}>
              {m.displayName}
            </option>
          ))}
        </select>
      </div>
    </Card>
  )
}
