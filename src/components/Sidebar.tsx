import { NavLink } from 'react-router-dom'
import { navigation } from '../data/mock'

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col gap-6 lg:flex">
      <div className="card glass animate-float-in px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          OMH Portal
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Infrastructure Control</h1>
        <p className="mt-2 text-sm text-slate-500">
          Provision, import, and promote infrastructure with live ARM data and GitHub Actions.
        </p>
      </div>

      <nav className="card px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Navigation</p>
        <div className="mt-3 flex flex-col gap-2">
          {navigation.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-navy text-white shadow-soft' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
              end
            >
              <span>{item.label}</span>
              <span className="text-xs text-slate-400">⌘</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="card px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Build Guardrails</p>
        <ul className="mt-3 space-y-3 text-sm text-slate-600">
          <li>OIDC auth enforced for deploys</li>
          <li>Manual promotion to prod only</li>
          <li>Drift detection on every merge</li>
        </ul>
      </div>
    </aside>
  )
}
