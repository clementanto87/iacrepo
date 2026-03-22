export function PromotePage() {
  return (
    <>
      <section className="card px-6 py-5">
        <h2 className="text-2xl font-semibold">Promote to Production</h2>
        <p className="mt-2 text-sm text-slate-500">
          Manual, audited promotion of Bicep changes from dev to prod with environment protection.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">Release Summary</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Pending commits</span>
              <span className="font-semibold text-navy">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Modules impacted</span>
              <span className="font-semibold text-navy">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated runtime</span>
              <span className="font-semibold text-navy">7-9 minutes</span>
            </div>
          </div>
          <button className="mt-6 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white shadow-soft">
            Start Manual Promotion
          </button>
          <p className="mt-3 text-xs text-slate-400">
            Requires approval and environment lock in GitHub Actions.
          </p>
        </div>

        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">Pre-flight Checklist</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>What-if shows zero unintended changes</li>
            <li>OIDC federated identity verified</li>
            <li>Prod subscription ID injected via secrets</li>
            <li>Drift scan completed within last 24 hours</li>
          </ul>
          <button className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Run Pre-flight Checks
          </button>
        </div>
      </section>
    </>
  )
}
