import { useState } from 'react'
import { Check } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useActiveMember } from './ActiveMemberProvider'
import { memberSubtitle } from './roles'

export function MemberSwitcher() {
  const { member, members, setActiveId } = useActiveMember()
  const [open, setOpen] = useState(false)

  if (!member) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass flex w-full items-center gap-3 rounded-none border-x-0 border-t-0 px-4 py-2.5 text-left"
      >
        <Avatar name={member.displayName} size={36} />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Du er</p>
          <p className="truncate font-medium leading-tight text-ink">
            {member.displayName}{' '}
            <span className="font-normal text-muted">
              · {memberSubtitle(member)}
            </span>
          </p>
        </div>
        <span className="text-sm font-semibold text-slate">Skift</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto max-h-[80%] w-full max-w-[700px] overflow-y-auto rounded-t-[34px] bg-[#E3EAF5] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-steel/30" />
            <h2 className="font-display mb-1 px-1 text-2xl font-semibold text-ink">
              Vis appen som
            </h2>
            <p className="mb-4 px-1 text-sm text-muted">
              Vælg et familiemedlem for at se deres rolle-tilpassede billede.
            </p>
            <div className="space-y-2">
              {members.map((m) => {
                const active = m.membershipId === member.membershipId
                return (
                  <button
                    key={m.membershipId}
                    onClick={() => {
                      setActiveId(m.membershipId)
                      setOpen(false)
                    }}
                    className={`glass flex w-full items-center gap-3 p-3 text-left transition ${
                      active ? 'ring-2 ring-slate' : ''
                    }`}
                  >
                    <Avatar name={m.displayName} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {m.displayName}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {memberSubtitle(m)}
                      </p>
                    </div>
                    {active && <Check size={20} strokeWidth={1.5} className="text-slate" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
