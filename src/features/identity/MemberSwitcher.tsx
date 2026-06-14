import { useState } from 'react'
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
        className="flex w-full items-center gap-3 bg-surface px-4 py-2 text-left"
      >
        <Avatar name={member.displayName} color={member.avatarColor} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">Du er</p>
          <p className="truncate font-semibold leading-tight">
            {member.displayName}{' '}
            <span className="font-normal text-muted">
              · {memberSubtitle(member)}
            </span>
          </p>
        </div>
        <span className="text-sm font-semibold text-primary">Skift</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80%] w-full overflow-y-auto rounded-t-3xl bg-bg p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted/40" />
            <h2 className="mb-1 px-1 text-xl font-bold">Vis appen som…</h2>
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
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      active ? 'bg-primary/10 ring-2 ring-primary' : 'bg-surface'
                    }`}
                  >
                    <Avatar name={m.displayName} color={m.avatarColor} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{m.displayName}</p>
                      <p className="truncate text-sm text-muted">
                        {memberSubtitle(m)}
                      </p>
                    </div>
                    {active && <span className="text-primary">✓</span>}
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
