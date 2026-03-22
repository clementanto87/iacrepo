import { useMemo } from 'react'

type HeaderProps = {
  environment: 'dev' | 'prod'
  onEnvironmentChange: (value: 'dev' | 'prod') => void
}

export function Header({ environment, onEnvironmentChange }: HeaderProps) {
  const environmentBadge = useMemo(() => {
    if (environment === 'dev') {
      return { label: 'Development', style: 'bg-teal/10 text-teal' }
    }
    return { label: 'Production', style: 'bg-amber-100 text-amber-700' }
  }, [environment])

  return (
    <header className="card animate-float-in px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Tentamus Order Manager Hub
          </p>
          <h2 className="mt-2 text-3xl font-semibold">OMH Infrastructure Portal</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Generate Bicep, reconcile imports, and trigger controlled deployments without leaving the browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">
            <span className={`badge ${environmentBadge.style}`}>{environmentBadge.label}</span>
            <select
              value={environment}
              onChange={(event) => onEnvironmentChange(event.target.value as 'dev' | 'prod')}
              className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
            >
              <option value="dev">Dev</option>
              <option value="prod">Prod</option>
            </select>
          </div>
          <button className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-soft">
            Trigger What-if
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Open GitHub Actions
          </button>
        </div>
      </div>
    </header>
  )
}
