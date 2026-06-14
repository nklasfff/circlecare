import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Providers } from './providers'
import { RequireAuth } from './RequireAuth'
import { AppLayout } from './AppLayout'
import { ComingSoon } from './ComingSoon'
import { CoverageScreen } from '@/features/coverage/CoverageScreen'

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <RequireAuth>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<CoverageScreen />} />
              <Route path="opgaver" element={<ComingSoon title="Opgaver" />} />
              <Route
                path="kalender"
                element={<ComingSoon title="Kalender" />}
              />
              <Route
                path="beskeder"
                element={<ComingSoon title="Beskeder" />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </RequireAuth>
      </BrowserRouter>
    </Providers>
  )
}
