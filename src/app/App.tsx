import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Providers } from './providers'
import { AppLayout } from './AppLayout'
import { ComingSoon } from './ComingSoon'
import { CoverageScreen } from '@/features/coverage/CoverageScreen'
import { TasksScreen } from '@/features/tasks/TasksScreen'

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<CoverageScreen />} />
            <Route path="opgaver" element={<TasksScreen />} />
            <Route path="kalender" element={<ComingSoon title="Kalender" />} />
            <Route path="beskeder" element={<ComingSoon title="Beskeder" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  )
}
