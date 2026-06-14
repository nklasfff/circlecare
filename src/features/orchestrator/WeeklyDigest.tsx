import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { CoverageItem } from '@/types/database'
import { Icon } from '@/components/ui/icons'
import { useFamilyThreads, useCommunicationMutations } from '@/data/hooks'
import { summarize, pendingDecisions } from './digest'

/**
 * Orkestrator-boks øverst på dækningsbilledet: et regelbaseret ugeoverblik
 * (planlagt / dækket / mangler) plus hængende beslutninger (åbne tråde uden
 * svar i et stykke tid). Beregnes lokalt på mock-data; klar til at få "smartere"
 * formuleringer fra AI senere.
 */
export function WeeklyDigest({
  items,
  familyId,
}: {
  items: CoverageItem[]
  familyId: string | null | undefined
}) {
  const { data: threads } = useFamilyThreads(familyId)
  const { updateThread } = useCommunicationMutations()

  const s = summarize(items)
  const pending = pendingDecisions(threads ?? [])

  const calm = s.uncovered === 0 && pending.length === 0

  return (
    <div className="glass enter mb-8 p-6">
      <p className="eyebrow mb-5">Ugen kort</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat n={s.planned} label="Planlagt" />
        <Stat n={s.covered} label="Dækket" />
        <Stat n={s.uncovered} label="Mangler" alert={s.uncovered > 0} />
      </div>

      {calm && (
        <p className="mt-6 text-center text-sm italic text-muted">
          Ingen løse ender lige nu — alt er dækket, og ingen beslutninger venter.
        </p>
      )}

      {pending.length > 0 && (
        <div className="mt-7 border-t border-white/50 pt-6">
          <p className="eyebrow mb-4">Beslutninger der venter</p>
          <div className="space-y-4">
            {pending.map(({ thread, daysStale }) => (
              <div
                key={thread.id}
                className="flex items-center gap-3 rounded-r-xl py-1.5 pl-4"
                style={{ borderLeft: '2px solid #3C4E86' }}
              >
                <Icon as={Clock} size={20} className="shrink-0 text-[#3C4E86]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{thread.title}</p>
                  <p className="text-[12px] text-muted">
                    {daysStale} dage uden svar
                  </p>
                </div>
                <Link
                  to={`/beskeder/${thread.track_id}/${thread.id}`}
                  className="hoverable shrink-0 text-sm font-semibold text-slate"
                >
                  Åbn
                </Link>
                <button
                  onClick={() =>
                    updateThread.mutate({
                      id: thread.id,
                      patch: { status: 'resolved' },
                    })
                  }
                  className="shrink-0 text-sm text-muted transition active:scale-95"
                >
                  Løst
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  n,
  label,
  alert = false,
}: {
  n: number
  label: string
  alert?: boolean
}) {
  return (
    <div>
      <p
        className="font-display text-[36px] font-medium leading-none"
        style={{ color: alert ? '#3C4E86' : '#2C3C61' }}
      >
        {n}
      </p>
      <p className="eyebrow mt-2">{label}</p>
    </div>
  )
}
