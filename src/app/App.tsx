import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Providers } from './providers'
import { AppLayout } from './AppLayout'
import { CoverageScreen } from '@/features/coverage/CoverageScreen'
import { TasksScreen } from '@/features/tasks/TasksScreen'
import { CalendarScreen } from '@/features/calendar/CalendarScreen'
import { TracksScreen } from '@/features/communication/TracksScreen'
import { ThreadsScreen } from '@/features/communication/ThreadsScreen'
import { ThreadScreen } from '@/features/communication/ThreadScreen'

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<CoverageScreen />} />
            <Route path="opgaver" element={<TasksScreen />} />
            <Route path="kalender" element={<CalendarScreen />} />
            <Route path="beskeder" element={<TracksScreen />} />
            <Route path="beskeder/:trackId" element={<ThreadsScreen />} />
            <Route
              path="beskeder/:trackId/:threadId"
              element={<ThreadScreen />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  )
}
