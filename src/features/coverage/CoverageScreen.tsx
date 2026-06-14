import { useMemo } from 'react'
import { format, isToday, isSameDay } from 'date-fns'
import { da } from 'date-fns/locale'
import type { CoverageItem } from '@/types/database'
import type { MemberView } from '@/data/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { useFamilyId, useMembers, useWeekCoverage, memberName } from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'
import { isCoordinator, matchesRole } from '@/features/identity/roles'

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
  const { member } = useActiveMember()
  const activeId = member?.membershipId ?? null

  const groups = useMemo(() => eachDay(items ?? []), [items])
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

      {!isLoading && !isError && member && (
        <Lens member={member} items={items ?? []} />
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
                  isMine={item.responsible === activeId}
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
                      isMine={item.responsible === activeId}
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

/** Rolle-tilpasset overblik øverst: koordinatoren ser huller, en rolle-ansvarlig
 *  ser sit eget ansvar, og den der modtager omsorg ser sin egen uge. */
function Lens({ member, items }: { member: MemberView; items: CoverageItem[] }) {
  const uncovered = items.filter((i) => i.uncovered)
  const mine = items.filter((i) => i.responsible === member.membershipId)
  const roleUncovered = uncovered.filter((i) => matchesRole(member, i.category))

  // Koordinator: fokus på huller i hele familien.
  if (isCoordinator(member)) {
    const ok = uncovered.length === 0
    return (
      <LensCard tone={ok ? 'green' : 'orange'}>
        {ok
          ? '✓ Alt er dækket i denne uge'
          : `⚠️ ${uncovered.length} ${uncovered.length === 1 ? 'ting mangler' : 'ting mangler'} en ansvarlig — fordel dem`}
      </LensCard>
    )
  }

  // Modtager omsorg (far/mor): neutral oversigt over egen uge.
  if (member.isCareRecipient) {
    return (
      <LensCard tone="blue">
        🗓️ Din uge: {items.length}{' '}
        {items.length === 1 ? 'ting planlagt' : 'ting planlagt'}
      </LensCard>
    )
  }

  // Rolle-ansvarlig (mad/læge/transport): eget ansvar + nudge om huller i rollen.
  return (
    <LensCard tone={mine.length > 0 ? 'green' : 'blue'}>
      {mine.length > 0
        ? `Du dækker ${mine.length} ${mine.length === 1 ? 'ting' : 'ting'} denne uge`
        : 'Du har intet planlagt denne uge'}
      {roleUncovered.length > 0 && (
        <span className="mt-1 block text-sm font-normal" style={{ color: '#e65100' }}>
          {roleUncovered.length} i dit område mangler en ansvarlig
        </span>
      )}
    </LensCard>
  )
}

function LensCard({
  tone,
  children,
}: {
  tone: 'green' | 'orange' | 'blue'
  children: React.ReactNode
}) {
  const bg = tone === 'green' ? '#e8f5e9' : tone === 'orange' ? '#fff3e0' : '#e7f0ff'
  const fg = tone === 'green' ? '#2e7d32' : tone === 'orange' ? '#e65100' : '#0051d5'
  return (
    <div className="mb-5 rounded-2xl p-4" style={{ background: bg }}>
      <p className="font-semibold" style={{ color: fg }}>
        {children}
      </p>
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
  isMine,
}: {
  item: CoverageItem
  responsibleName: string | null
  isMine: boolean
}) {
  const time = item.at ? format(new Date(item.at), 'HH:mm') : null
  const done = item.status === 'done'

  return (
    <Card
      accent={item.uncovered ? '#ff3b30' : '#34c759'}
      className={`${done ? 'opacity-50' : ''} ${isMine ? 'ring-2 ring-primary/40' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{CATEGORY_ICON[item.category] ?? '•'}</span>
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
        ) : isMine ? (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            Dig
          </span>
        ) : (
          <Avatar name={responsibleName} size={32} />
        )}
      </div>
    </Card>
  )
}
