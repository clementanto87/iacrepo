import { useState } from 'react'
import { createProvisionDraft } from '../data/api'
import type { ProvisionBlueprint } from '../data/types'

export function ProvisionPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ProvisionBlueprint>({
    resourceType: 'Container Apps',
    environment: 'dev',
    prefix: 'omh-api',
  })

  async function handleGenerate() {
    setLoading(true)
    setStatus(null)
    try {
      const result = await createProvisionDraft(form)
      setStatus(`Draft created: ${result.id}`)
    } catch {
      setStatus('Unable to create draft. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="card px-6 py-5">
        <h2 className="text-2xl font-semibold">Provisioning Studio</h2>
        <p className="mt-2 text-sm text-slate-500">
          Build new infrastructure with guided inputs, policy checks, and instant Bicep previews.
        </p>
      </section>

      {status ? <div className="card px-5 py-4 text-sm text-slate-600">{status}</div> : null}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">Provision Blueprint</h3>
          <p className="mt-2 text-sm text-slate-500">
            Select the service type, assign env constraints, and generate module-ready parameters.
          </p>
          <div className="mt-5 grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Resource type
              <select
                value={form.resourceType}
                onChange={(event) => setForm({ ...form, resourceType: event.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option>Container Apps</option>
                <option>Service Bus</option>
                <option>Cosmos DB</option>
                <option>Container Registry</option>
                <option>Managed Identity</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Environment
              <select
                value={form.environment}
                onChange={(event) => setForm({ ...form, environment: event.target.value as 'dev' | 'prod' })}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="dev">Dev</option>
                <option value="prod">Prod</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Resource naming prefix
              <input
                value={form.prefix}
                onChange={(event) => setForm({ ...form, prefix: event.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="omh-api"
              />
            </label>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            {loading ? 'Generating…' : 'Generate Template'}
          </button>
        </div>

        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">Policy Checks</h3>
          <p className="mt-2 text-sm text-slate-500">
            Guardrails applied before a PR can be created for new infrastructure.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Region aligned to default compliance policy</li>
            <li>OIDC workload identity enforced</li>
            <li>Autoscale throughput explicitly declared</li>
          </ul>
          <button className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Run Validation
          </button>
        </div>
      </section>
    </>
  )
}
