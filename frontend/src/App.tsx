import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDarkMode } from './hooks/useDarkMode'
import { ToastProvider } from './components/Toast'
import { Navbar } from './components/Navbar'
import { TodayPage } from './pages/TodayPage'
import { ProblemsPage } from './pages/ProblemsPage'
import { StatsPage } from './pages/StatsPage'
import { ActivityLogPage } from './pages/ActivityLogPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const { dark, toggle } = useDarkMode()

  return (
    <ToastProvider>
      <BrowserRouter>
        <Navbar dark={dark} onToggleDark={toggle} />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ToastProvider>
  )
}
