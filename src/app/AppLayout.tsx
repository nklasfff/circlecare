import { NavLink, Outlet } from 'react-router-dom'
import { MemberSwitcher } from '@/features/identity/MemberSwitcher'
import { Icon, TabIcons } from '@/components/ui/icons'

const TABS = [
  { to: '/', label: 'Dækning', icon: TabIcons.coverage, end: true },
  { to: '/opgaver', label: 'Opgaver', icon: TabIcons.tasks },
  { to: '/kalender', label: 'Kalender', icon: TabIcons.calendar },
  { to: '/beskeder', label: 'Beskeder', icon: TabIcons.messages },
]

export function AppLayout() {
  return (
    <div className="app-frame flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40">
        <MemberSwitcher />
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="glass sticky bottom-0 flex rounded-none border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-center transition ${
                isActive ? 'text-slate' : 'text-steel/60'
              }`
            }
          >
            <Icon as={tab.icon} size={24} />
            <span className="text-[10px] font-medium tracking-wide">
              {tab.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
