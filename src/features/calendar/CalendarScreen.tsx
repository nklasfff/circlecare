import { useState } from 'react'
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  addDays,
} from 'date-fns'
import { da } from 'date-fns/locale'
import type { CalendarEvent } from '@/types/database'
import type { MemberView } from '@/data/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import {
  useFamilyId,
  useMembers,
  useEvents,
  useEventMutations,
  memberName,
} from '@/data/hooks'
import { eventIcon, eventLabel } from './categories'
import { MonthGrid } from './MonthGrid'
import { AddEventForm } from './AddEventForm'

type View = 'month' | 'week'

export function CalendarScreen() {
  const { data: familyId } = useFamilyId()
  const { data: members } = useMembers(familyId)
  const { data: events, isLoading, isError } = useEvents(familyId)

  const [view, setView] = useState<View>('month')
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [month, setMonth] = useState(new Date())

  const list = events ?? []

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">Kalender</h1>
      </header>

      <div className="mb-5 flex gap-2">
        <Segment active={view === 'month'} onClick={() => setView('month')}>
          Måned
        </Segment>
        <Segment active={view === 'week'} onClick={() => setView('week')}>
          Uge
        </Segment>
      </div>

      {familyId && members && (
        <AddEventForm
          familyId={familyId}
          members={members}
          defaultDay={selectedDay}
        />
      )}

      {isLoading && <p className="text-muted">Henter kalender…</p>}
      {isError && <p className="text-danger">Kunne ikke hente kalender.</p>}

      {!isLoading && !isError && view === 'month' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              aria-label="Forrige måned"
              onClick={() => setMonth(subMonths(month, 1))}
              className="px-3 text-2xl text-primary"
            >
              ‹
            </button>
            <span className="text-lg font-semibold capitalize">
              {format(month, 'MMMM yyyy', { locale: da })}
            </span>
            <button
              aria-label="Næste måned"
              onClick={() => setMonth(addMonths(month, 1))}
              className="px-3 text-2xl text-primary"
            >
              ›
            </button>
          </div>

          <MonthGrid
            month={month}
            events={list}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          <DayAgenda
            day={selectedDay}
            events={list}
            members={members ?? []}
          />
        </>
      )}

      {!isLoading && !isError && view === 'week' && (
        <WeekView
          anchor={selectedDay}
          events={list}
          members={members ?? []}
        />
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
      className={`flex-1 rounded-xl px-4 py-2 font-semibold transition ${
        active ? 'bg-primary text-white' : 'bg-surface text-primary'
      }`}
    >
      {children}
    </button>
  )
}

function DayAgenda({
  day,
  events,
  members,
}: {
  day: Date
  events: CalendarEvent[]
  members: MemberView[]
}) {
  const dayEvents = events
    .filter((e) => isSameDay(new Date(e.starts_at), day))
    .sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1))

  return (
    <section>
      <h2 className="mb-2 ml-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {format(day, 'EEEE d. MMMM', { locale: da })}
      </h2>
      {dayEvents.length === 0 ? (
        <Card>
          <p className="text-muted">Ingen aftaler denne dag.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((e) => (
            <EventRow key={e.id} event={e} members={members} />
          ))}
        </div>
      )}
    </section>
  )
}

function WeekView({
  anchor,
  events,
  members,
}: {
  anchor: Date
  events: CalendarEvent[]
  members: MemberView[]
}) {
  const monday = startOfWeek(anchor, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  return (
    <div className="space-y-5">
      {days.map((day) => {
        const dayEvents = events
          .filter((e) => isSameDay(new Date(e.starts_at), day))
          .sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1))
        return (
          <section key={day.toISOString()}>
            <h2 className="mb-2 ml-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {format(day, 'EEEE d. MMM', { locale: da })}
            </h2>
            {dayEvents.length === 0 ? (
              <Card className="opacity-50">
                <p className="text-muted">Ingen aftaler</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((e) => (
                  <EventRow key={e.id} event={e} members={members} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function EventRow({
  event,
  members,
}: {
  event: CalendarEvent
  members: MemberView[]
}) {
  const { update, remove } = useEventMutations()
  const time = format(new Date(event.starts_at), 'HH:mm')
  const covererName = memberName(members, event.covered_by)

  return (
    <Card accent={event.covered_by ? '#34c759' : '#ff3b30'}>
      <div className="flex items-center gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center">
          <span className="text-2xl">{eventIcon(event.category)}</span>
          <span className="text-xs font-semibold text-primary">{time}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{event.title}</p>
          <p className="truncate text-sm text-muted">
            {eventLabel(event.category)}
            {event.location ? ` · ${event.location}` : ''}
          </p>
        </div>
        {event.covered_by && <Avatar name={covererName} size={32} />}
        <button
          aria-label="Slet aftale"
          onClick={() => remove.mutate(event.id)}
          className="shrink-0 px-1 text-lg text-muted transition active:scale-90"
        >
          ✕
        </button>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-muted">
        Hvem dækker
        <select
          value={event.covered_by ?? ''}
          onChange={(e) =>
            update.mutate({
              id: event.id,
              patch: { covered_by: e.target.value || null },
            })
          }
          className={`flex-1 rounded-xl bg-bg px-3 py-2 text-base outline-none focus:ring-2 focus:ring-primary ${
            event.covered_by ? 'text-ink' : 'font-semibold text-danger'
          }`}
        >
          <option value="">Mangler dækning</option>
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
