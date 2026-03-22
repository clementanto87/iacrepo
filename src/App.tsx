import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { DriftPage } from './pages/DriftPage'
import { ImportPage } from './pages/ImportPage'
import { PromotePage } from './pages/PromotePage'
import { ProvisionPage } from './pages/ProvisionPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/provision" element={<ProvisionPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/promote" element={<PromotePage />} />
          <Route path="/drift" element={<DriftPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
