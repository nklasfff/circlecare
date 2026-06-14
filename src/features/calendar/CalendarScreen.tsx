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
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '@/types/database'
import type { MemberView } from '@/data/types'
import { Card } from '@/components/ui/Card'
import { Avatar, avatarTone } from '@/components/ui/Avatar'
import { CategoryIcon, Icon } from '@/components/ui/icons'
import {
  useFamilyId,
  useMembers,
  useEvents,
  useEventMutations,
} from '@/data/hooks'
import { eventLabel } from './categories'
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
    <div className="mx-auto w-full max-w-[700px] px-5 pb-28 pt-7">
      <header className="enter mb-6">
        <p className="eyebrow">Kalender</p>
        <h1 className="font-display mt-3 text-[2.4rem] leading-[1.1] text-ink">
          Hvem gør hvad, og <span className="text-accent">hvornår</span>.
        </h1>
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
      {isError && <p className="text-[#B23A3A]">Kunne ikke hente kalender.</p>}

      {!isLoading && !isError && view === 'month' && (
        <>
          <div className="mb-4 mt-1 flex items-center justify-between py-1">
            <button
              aria-label="Forrige måned"
              onClick={() => setMonth(subMonths(month, 1))}
              className="hoverable p-2 text-slate"
            >
              <ChevronLeft size={26} strokeWidth={1.5} />
            </button>
            <span className="font-display text-[26px] capitalize text-ink">
              {format(month, 'MMMM yyyy', { locale: da })}
            </span>
            <button
              aria-label="Næste måned"
              onClick={() => setMonth(addMonths(month, 1))}
              className="hoverable p-2 text-slate"
            >
              <ChevronRight size={26} strokeWidth={1.5} />
            </button>
          </div>

          <MonthGrid
            month={month}
            events={list}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          <DayAgenda day={selectedDay} events={list} members={members ?? []} />
        </>
      )}

      {!isLoading && !isError && view === 'week' && (
        <WeekView anchor={selectedDay} events={list} members={members ?? []} />
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
      <h2 className="eyebrow mb-4 ml-1">
        {format(day, 'EEEE d. MMMM', { locale: da })}
      </h2>
      {dayEvents.length === 0 ? (
        <p className="py-6 text-center italic text-muted">
          Ingen aftaler denne dag.
        </p>
      ) : (
        <div className="space-y-4">
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
            <h2 className="eyebrow mb-4 ml-1">
              {format(day, 'EEEE d. MMM', { locale: da })}
            </h2>
            {dayEvents.length === 0 ? (
              <p className="py-3 text-center italic text-muted">Ingen aftaler</p>
            ) : (
              <div className="space-y-4">
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
  const covererName =
    members.find((m) => m.membershipId === event.covered_by)?.displayName ?? null
  const accent = event.covered_by ? avatarTone(covererName) : '#3C4E86'

  return (
    <Card accent={accent}>
      <div className="flex items-center gap-3.5">
        <div className="flex w-11 shrink-0 flex-col items-center gap-0.5">
          <CategoryIcon category={event.category} className="text-steel" />
          <span className="text-xs font-semibold text-slate">{time}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-medium text-ink">{event.title}</p>
          <p className="truncate text-[12px] text-muted">
            {eventLabel(event.category)}
            {event.location ? ` · ${event.location}` : ''}
          </p>
        </div>
        {event.covered_by && <Avatar name={covererName} size={32} />}
        <button
          aria-label="Slet aftale"
          onClick={() => remove.mutate(event.id)}
          className="shrink-0 text-steel/70 transition active:scale-90"
        >
          <Icon as={Trash2} size={18} />
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
          className={`flex-1 rounded-xl bg-white/55 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-slate ${
            event.covered_by ? 'text-ink' : 'font-semibold text-[#3C4E86]'
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
