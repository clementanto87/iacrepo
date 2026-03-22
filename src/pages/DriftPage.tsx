import { driftTimeline } from '../data/mock'

export function DriftPage() {
  return (
    <>
      <section className="card px-6 py-5">
        <h2 className="text-2xl font-semibold">Drift Monitor</h2>
        <p className="mt-2 text-sm text-slate-500">
          Track configuration mismatches between live Azure resources and committed Bicep modules.
        </p>
      </section>

      <section className="card px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Recent Findings</h3>
            <p className="text-sm text-slate-500">Last scan completed 12 minutes ago.</p>
          </div>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Run Drift Scan
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {driftTimeline.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">{item.title}</p>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
