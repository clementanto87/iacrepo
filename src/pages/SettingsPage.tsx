export function SettingsPage() {
  return (
    <>
      <section className="card px-6 py-5">
        <h2 className="text-2xl font-semibold">Portal Settings</h2>
        <p className="mt-2 text-sm text-slate-500">
          Configure subscriptions, authentication, and deployment guardrails for the portal.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">Subscriptions</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Dev subscription</span>
              <span className="badge bg-emerald-100 text-emerald-700">Linked</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Prod subscription</span>
              <span className="badge bg-amber-100 text-amber-700">Manual</span>
            </div>
          </div>
          <button className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Manage Subscriptions
          </button>
        </div>

        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">OIDC & Secrets</h3>
          <p className="mt-2 text-sm text-slate-500">
            Ensure GitHub Actions has federated access without storing static credentials.
          </p>
          <button className="mt-6 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
            Verify OIDC Configuration
          </button>
        </div>
      </section>
    </>
  )
}
