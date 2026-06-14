import { useMemo } from 'react'
import { format, isToday, isSameDay } from 'date-fns'
import { da } from 'date-fns/locale'
import type { CoverageItem } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import {
  useFamilyId,
  useMembers,
  useWeekCoverage,
  memberName,
} from '@/data/hooks'

const CATEGORY_ICON: Record<string, string> = {
  medicine: '💊',
  food: '🍲',
  transport: '🚗',
  appointment: '📅',
  visit: '👋',
  medical: '👨‍⚕️',
  meal: '🍽️',
  other: '•',
}

function eachDay(items: CoverageItem[]): { day: Date; items: CoverageItem[] }[] {
  const groups: { day: Date; items: CoverageItem[] }[] = []
  for (const item of items) {
    if (!item.at) continue
    const day = new Date(item.at)
    const bucket = groups.find((g) => isSameDay(g.day, day))
    if (bucket) bucket.items.push(item)
    else groups.push({ day, items: [item] })
  }
  return groups
}

export function CoverageScreen() {
  const { data: familyId } = useFamilyId()
  const { data: members } = useMembers(familyId)
  const { data: items, isLoading, isError, weekEnd } = useWeekCoverage(familyId)

  const groups = useMemo(() => eachDay(items ?? []), [items])
  const uncoveredCount = useMemo(
    () => (items ?? []).filter((i) => i.uncovered).length,
    [items],
  )

  const todayGroup = groups.find((g) => isToday(g.day))
  const restGroups = groups.filter((g) => !isToday(g.day))

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <header className="mb-5">
        <h1 className="text-3xl font-bold capitalize">Dækning</h1>
        <p className="mt-1 text-muted">
          {format(new Date(), 'EEEE d. MMMM', { locale: da })} – uge{' '}
          {format(new Date(), 'w', { locale: da })}
        </p>
      </header>

      {!isLoading && !isError && (
        <div
          className="mb-5 rounded-2xl p-4"
          style={{
            background: uncoveredCount === 0 ? '#e8f5e9' : '#fff3e0',
          }}
        >
          {uncoveredCount === 0 ? (
            <p className="font-semibold" style={{ color: '#2e7d32' }}>
              ✓ Alt er dækket i denne uge
            </p>
          ) : (
            <p className="font-semibold" style={{ color: '#e65100' }}>
              ⚠️ {uncoveredCount}{' '}
              {uncoveredCount === 1 ? 'ting mangler' : 'ting mangler'} en
              ansvarlig
            </p>
          )}
        </div>
      )}

      {isLoading && <p className="text-muted">Henter dækning…</p>}
      {isError && (
        <p className="text-danger">
          Kunne ikke hente dækning. Tjek din forbindelse.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <Section title="I dag">
            {todayGroup && todayGroup.items.length > 0 ? (
              todayGroup.items.map((item) => (
                <CoverageRow
                  key={item.id}
                  item={item}
                  responsibleName={memberName(members, item.responsible)}
                />
              ))
            ) : (
              <Card>
                <p className="text-muted">Ingen opgaver eller aftaler i dag.</p>
              </Card>
            )}
          </Section>

          <Section
            title={`Resten af ugen (til ${format(weekEnd, 'd. MMM', {
              locale: da,
            })})`}
          >
            {restGroups.length > 0 ? (
              restGroups.map((group) => (
                <div key={group.day.toISOString()} className="mb-4">
                  <p className="mb-2 ml-1 text-sm font-semibold capitalize text-muted">
                    {format(group.day, 'EEEE d. MMM', { locale: da })}
                  </p>
                  {group.items.map((item) => (
                    <CoverageRow
                      key={item.id}
                      item={item}
                      responsibleName={memberName(members, item.responsible)}
                    />
                  ))}
                </div>
              ))
            ) : (
              <Card>
                <p className="text-muted">Ikke mere planlagt i denne uge.</p>
              </Card>
            )}
          </Section>
        </>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 ml-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function CoverageRow({
  item,
  responsibleName,
}: {
  item: CoverageItem
  responsibleName: string | null
}) {
  const time = item.at ? format(new Date(item.at), 'HH:mm') : null
  const done = item.status === 'done'

  return (
    <Card
      accent={item.uncovered ? '#ff3b30' : '#34c759'}
      className={done ? 'opacity-50' : ''}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {CATEGORY_ICON[item.category] ?? '•'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{item.title}</p>
          <p className="text-sm text-muted">
            {time ? `Kl. ${time}` : 'Uden tidspunkt'}
            {item.kind === 'task' && done ? ' · Klaret ✓' : ''}
          </p>
        </div>
        {item.uncovered ? (
          <span className="rounded-full bg-danger/15 px-3 py-1 text-xs font-semibold text-danger">
            Mangler ansvarlig
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar name={responsibleName} size={32} />
          </div>
        )}
      </div>
    </Card>
  )
}
