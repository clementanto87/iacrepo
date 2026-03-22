import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-8">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
