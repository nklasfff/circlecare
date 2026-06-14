import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns'
import type { CalendarEvent } from '@/types/database'
import { eventColor } from './categories'

const WEEKDAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S']

interface Props {
  month: Date
  events: CalendarEvent[]
  selectedDay: Date
  onSelectDay: (day: Date) => void
}

export function MonthGrid({ month, events, selectedDay, onSelectDay }: Props) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  function eventsOn(day: Date): CalendarEvent[] {
    return events.filter((e) => isSameDay(new Date(e.starts_at), day))
  }

  return (
    <div className="mb-4 rounded-2xl bg-surface-2 p-4">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-muted">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)
          const selected = isSameDay(day, selectedDay)
          const dayEvents = eventsOn(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={`relative flex aspect-square items-center justify-center rounded-full text-sm transition ${
                today
                  ? 'bg-primary font-bold text-white'
                  : selected
                    ? 'bg-primary/15 font-semibold text-primary'
                    : inMonth
                      ? 'text-ink'
                      : 'text-muted/40'
              }`}
            >
              {format(day, 'd')}
              {dayEvents.length > 0 && !today && (
                <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="h-1 w-1 rounded-full"
                      style={{ background: eventColor(e.category) }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
