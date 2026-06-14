import { NavLink, Outlet } from 'react-router-dom'
import { MemberSwitcher } from '@/features/identity/MemberSwitcher'

const TABS = [
  { to: '/', label: 'Dækning', icon: '🛡️', end: true },
  { to: '/opgaver', label: 'Opgaver', icon: '✓' },
  { to: '/kalender', label: 'Kalender', icon: '📅' },
  { to: '/beskeder', label: 'Beskeder', icon: '💬' },
]

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-black/5">
        <MemberSwitcher />
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 flex border-t border-black/10 bg-surface pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-center transition ${
                isActive ? 'opacity-100' : 'opacity-50'
              }`
            }
          >
            <span className="text-2xl leading-none">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
