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
    <div className="glass mb-4 p-4">
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
          const hasEvents = eventsOn(day).length > 0
          const plain = !today && !selected
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              style={
                plain && hasEvents
                  ? { background: 'rgba(60,78,134,.12)' }
                  : undefined
              }
              className={`relative flex aspect-square items-center justify-center rounded-full text-[15px] transition ${
                today
                  ? 'bg-[#2C3C61] font-semibold text-white'
                  : selected
                    ? 'bg-[#2C3C61]/15 font-semibold text-slate'
                    : inMonth
                      ? 'text-ink'
                      : 'text-muted/40'
              }`}
            >
              {format(day, 'd')}
              {hasEvents && !today && (
                <span
                  className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                  style={{ background: '#3C4E86' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
