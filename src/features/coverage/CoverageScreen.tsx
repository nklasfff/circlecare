import { useMemo } from 'react'
import { format, isToday, isSameDay } from 'date-fns'
import { da } from 'date-fns/locale'
import type { CoverageItem } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { CategoryIcon } from '@/components/ui/icons'
import {
  useFamilyId,
  useMembers,
  useWeekCoverage,
  useTaskMutations,
  useEventMutations,
  memberName,
} from '@/data/hooks'
import { useActiveMember } from '@/features/identity/ActiveMemberProvider'
import { WeeklyDigest } from '@/features/orchestrator/WeeklyDigest'

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
  const uncovered = useMemo(
    () => (items ?? []).filter((i) => i.uncovered).length,
    [items],
  )

  const todayGroup = groups.find((g) => isToday(g.day))
  const restGroups = groups.filter((g) => !isToday(g.day))

  return (
    <div className="mx-auto w-full max-w-[700px] px-5 pb-28 pt-7">
      <header className="enter mb-8">
        <p className="eyebrow">
          {format(new Date(), 'EEEE d. MMMM', { locale: da })} · uge{' '}
          {format(new Date(), 'w', { locale: da })}
        </p>
        <h1 className="font-display mt-3 text-[2.5rem] leading-[1.1] text-ink">
          {uncovered === 0 ? (
            <>
              Alt er <span className="text-accent">dækket</span> i dag.
            </>
          ) : (
            <>
              Det meste er <span className="text-accent">dækket</span> i dag.
            </>
          )}
        </h1>
        {uncovered > 0 && (
          <p className="mt-3 text-muted">
            {uncovered} {uncovered === 1 ? 'ting venter' : 'ting venter'} på, at
            nogen tager den.
          </p>
        )}
      </header>

      {isLoading && <p className="text-muted">Henter dækning…</p>}
      {isError && (
        <p className="text-[#B23A3A]">Kunne ikke hente dækning.</p>
      )}

      {!isLoading && !isError && (
        <>
          <WeeklyDigest items={items ?? []} familyId={familyId} />
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
              <p className="py-6 text-center italic text-muted">
                Ingen opgaver eller aftaler i dag.
              </p>
            )}
          </Section>

          <Section
            title={`Resten af ugen · til ${format(weekEnd, 'd. MMM', {
              locale: da,
            })}`}
          >
            {restGroups.length > 0 ? (
              restGroups.map((group) => (
                <div key={group.day.toISOString()} className="space-y-4">
                  <p className="ml-1 mt-1 text-sm font-medium capitalize text-muted">
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
              <p className="py-6 text-center italic text-muted">
                Ikke mere planlagt i denne uge.
              </p>
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
    <section className="mb-8">
      <h2 className="eyebrow mb-4 ml-1">{title}</h2>
      <div className="space-y-4">{children}</div>
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

  if (item.uncovered) return <ActionRow item={item} time={time} />

  return (
    <Card className={done ? 'opacity-55' : ''}>
      <div className="flex items-center gap-3.5">
        <CategoryIcon category={item.category} className="text-steel" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{item.title}</p>
          <p className="text-sm text-muted">
            {time ? `Kl. ${time}` : 'Uden tidspunkt'}
            {item.kind === 'task' && done ? ' · klaret' : ''}
          </p>
        </div>
        <div className={isMine ? 'rounded-full ring-2 ring-slate/40' : ''}>
          <Avatar name={responsibleName} size={32} />
        </div>
      </div>
    </Card>
  )
}

/** "Kræver handling" — samme blå familie, med den eneste udfyldte knap. */
function ActionRow({ item, time }: { item: CoverageItem; time: string | null }) {
  const { member } = useActiveMember()
  const { update: updateTask } = useTaskMutations()
  const { update: updateEvent } = useEventMutations()

  function take() {
    if (!member) return
    if (item.kind === 'task') {
      updateTask.mutate({ id: item.id, patch: { assigned_to: member.membershipId } })
    } else {
      updateEvent.mutate({ id: item.id, patch: { covered_by: member.membershipId } })
    }
  }

  return (
    <div
      className="rounded-[18px] p-5"
      style={{
        background: 'rgba(60,78,134,.15)',
        border: '1px solid rgba(60,78,134,.40)',
        borderLeft: '2px solid #3C4E86',
      }}
    >
      <div className="flex items-center gap-3.5">
        <CategoryIcon category={item.category} className="text-[#3C4E86]" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#2E4680]">{item.title}</p>
          <p className="text-sm" style={{ color: '#4C619B' }}>
            {time ? `Kl. ${time} · ` : ''}Ingen ansvarlig
          </p>
        </div>
        <button
          onClick={take}
          className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95"
          style={{
            background: '#3C4E86',
            color: '#EAF0FB',
            boxShadow: '0 6px 16px -8px rgba(28,38,64,.7)',
          }}
        >
          Tag den
        </button>
      </div>
    </div>
  )
}
