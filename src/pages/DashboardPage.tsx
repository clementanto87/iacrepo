import { useState } from 'react'
import { Header } from '../components/Header'
import { triggerWorkflow } from '../data/api'
import { useDashboardData } from '../hooks/useDashboardData'

const skeletonCard = 'animate-pulse rounded-xl border border-slate-100 bg-slate-50'

function formatRunStatus(status?: string | null, conclusion?: string | null) {
  if (!status) return 'Queued'
  if (status === 'completed') {
    return conclusion ? conclusion.replace('-', ' ') : 'Completed'
  }
  return status.replace('-', ' ')
}

function statusBadge(status?: string | null, conclusion?: string | null) {
  if (status === 'completed' && conclusion === 'success') return 'bg-emerald-100 text-emerald-700'
  if (status === 'completed' && conclusion === 'failure') return 'bg-rose-100 text-rose-700'
  if (status === 'completed' && conclusion === 'cancelled') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-100 text-amber-700'
}

export function DashboardPage() {
  const [environment, setEnvironment] = useState<'dev' | 'prod'>('dev')
  const { data, loading, error } = useDashboardData(environment)
  const [actionStatus, setActionStatus] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [showProdConfirm, setShowProdConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [useGeneratedParams, setUseGeneratedParams] = useState(true)
  const [deployConfig, setDeployConfig] = useState({
    resourceGroup: '',
    templateFile: '',
    parametersFile: '',
    namePrefix: 'omh',
    autoscaleMaxThroughput: 4000,
  })

  const generatedParametersJson = JSON.stringify(
    {
      $schema:
        'https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#',
      contentVersion: '1.0.0.0',
      parameters: {
        environment: { value: environment },
        namePrefix: { value: deployConfig.namePrefix || 'omh' },
        autoscaleMaxThroughput: { value: deployConfig.autoscaleMaxThroughput || 4000 },
      },
    },
    null,
    2,
  )

  function buildWorkflowInputs() {
    const inputs: Record<string, string> = {}
    if (deployConfig.resourceGroup.trim()) {
      inputs.resource_group = deployConfig.resourceGroup.trim()
    }
    if (deployConfig.templateFile.trim()) {
      inputs.template_file = deployConfig.templateFile.trim()
    }
    if (deployConfig.parametersFile.trim()) {
      inputs.parameters_file = deployConfig.parametersFile.trim()
    }
    if (useGeneratedParams) {
      inputs.parameters_json = generatedParametersJson
    }
    return inputs
  }

  async function handleWhatIf() {
    setActionBusy(true)
    setActionStatus(null)
    try {
      await triggerWorkflow('dev', 'main', { mode: 'what-if', environment, ...buildWorkflowInputs() })
      setActionStatus('Dev what-if workflow dispatched.')
    } catch {
      setActionStatus('Failed to dispatch dev workflow.')
    } finally {
      setActionBusy(false)
    }
  }

  async function handlePromotion() {
    setActionBusy(true)
    setActionStatus(null)
    try {
      await triggerWorkflow('prod', 'main', { confirm: 'true', ...buildWorkflowInputs() })
      setActionStatus('Prod promotion workflow dispatched.')
    } catch {
      setActionStatus('Failed to dispatch prod workflow.')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <>
      <Header environment={environment} onEnvironmentChange={setEnvironment} />

      {actionStatus ? (
        <div className="card px-5 py-4 text-sm text-slate-600">{actionStatus}</div>
      ) : null}

      {error ? (
        <div className="card px-5 py-4 text-sm text-rose-600">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(loading ? Array.from({ length: 4 }) : data?.metrics ?? []).map((metric, index) => (
          <div
            key={metric ? metric.label : `metric-${index}`}
            className={loading ? `${skeletonCard} h-28` : 'card px-5 py-4'}
          >
            {!loading && metric ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-navy">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-500">{metric.meta}</p>
              </>
            ) : null}
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="card px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Resource Overview</h3>
              <p className="text-sm text-slate-500">Live ARM snapshots across all five core services.</p>
            </div>
            <span className="badge bg-teal/10 text-teal">Live</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(loading ? Array.from({ length: 4 }) : data?.resources ?? []).map((card, index) => (
              <div
                key={card ? card.name : `resource-${index}`}
                className={
                  loading
                    ? `${skeletonCard} h-28`
                    : 'rounded-xl border border-slate-100 bg-slate-25 px-4 py-3'
                }
              >
                {!loading && card ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy">{card.name}</p>
                      <span className="badge bg-emerald-100 text-emerald-700">{card.status}</span>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {card.change}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{card.detail}</p>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="card px-5 py-5">
          <h3 className="text-xl font-semibold">Promote to Prod</h3>
          <p className="mt-2 text-sm text-slate-500">
            Dev branch is 3 commits ahead. Manual promotion required to trigger `deploy-prod.yml`.
          </p>
          <div className="mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Pending Bicep changes</span>
              <span className="font-semibold text-navy">5 modules</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Estimated deploy time</span>
              <span className="font-semibold text-navy">7-9 minutes</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Approval chain</span>
              <span className="font-semibold text-navy">2 reviewers</span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Resource Group
              <input
                value={deployConfig.resourceGroup}
                onChange={(event) =>
                  setDeployConfig((current) => ({ ...current, resourceGroup: event.target.value }))
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="omh-dev-rg"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Template File
              <input
                value={deployConfig.templateFile}
                onChange={(event) =>
                  setDeployConfig((current) => ({ ...current, templateFile: event.target.value }))
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="infra/main.bicep"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Parameters File
              <input
                value={deployConfig.parametersFile}
                onChange={(event) =>
                  setDeployConfig((current) => ({ ...current, parametersFile: event.target.value }))
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="infra/parameters/dev.json"
              />
            </label>
          </div>
          <button
            onClick={() => setShowProdConfirm(true)}
            disabled={actionBusy}
            className="mt-5 w-full rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            {actionBusy ? 'Dispatching…' : 'Confirm & Trigger Promotion'}
          </button>
          <p className="mt-3 text-xs text-slate-400">
            Requires explicit confirmation and environment lock in GitHub Actions.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">Provision Wizard</h3>
          <p className="mt-2 text-sm text-slate-500">
            Generate valid Bicep for Container Apps, Service Bus, Cosmos DB, ACR, and Managed Identity.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Service name
              <input
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="omh-api"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Azure region
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <option>West Europe</option>
                <option>North Europe</option>
                <option>East US</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Container Apps scale
              <input
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="1-10 replicas"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Cosmos DB throughput
              <input
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="autoscaleMaxThroughput"
              />
            </label>
          </div>
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Workflow Inputs
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Name Prefix
                <input
                  value={deployConfig.namePrefix}
                  onChange={(event) =>
                    setDeployConfig((current) => ({ ...current, namePrefix: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="omh"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Autoscale Max Throughput
                <input
                  type="number"
                  value={deployConfig.autoscaleMaxThroughput}
                  onChange={(event) =>
                    setDeployConfig((current) => ({
                      ...current,
                      autoscaleMaxThroughput: Number(event.target.value || 0),
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="4000"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Resource Group
                <input
                  value={deployConfig.resourceGroup}
                  onChange={(event) =>
                    setDeployConfig((current) => ({ ...current, resourceGroup: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="omh-dev-rg"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Template File
                <input
                  value={deployConfig.templateFile}
                  onChange={(event) =>
                    setDeployConfig((current) => ({ ...current, templateFile: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="infra/main.bicep"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Parameters File (optional)
                <input
                  value={deployConfig.parametersFile}
                  onChange={(event) =>
                    setDeployConfig((current) => ({ ...current, parametersFile: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="infra/parameters/dev.json"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useGeneratedParams}
                  onChange={(event) => setUseGeneratedParams(event.target.checked)}
                />
                Auto-generate parameters JSON
              </label>
              <span className="text-xs text-slate-400">Sent with workflow dispatch</span>
            </div>
            {useGeneratedParams ? (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-900/95 p-4 text-xs text-slate-200">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Generated Parameters</p>
                <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-slate-100">
{generatedParametersJson}
                </pre>
              </div>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleWhatIf}
              disabled={actionBusy}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
            >
              {actionBusy ? 'Dispatching…' : 'Trigger What-if'}
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
              Save Draft
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
              Create PR
            </button>
          </div>
          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-900/95 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bicep preview</p>
            <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-slate-100">
{`module containerApp './modules/containerApp.bicep' = {
  name: 'omh-api'
  params: {
    environment: '${environment}'
    region: 'westeurope'
    autoscaleMaxThroughput: 4000
  }
}
`}
            </pre>
          </div>
        </div>

        <div className="card px-5 py-5">
          <h3 className="text-xl font-semibold">Drift Monitor</h3>
          <p className="mt-2 text-sm text-slate-500">
            Recent configuration mismatches spotted by ARM and what-if checks.
          </p>
          <div className="mt-5 space-y-4">
            {(loading ? Array.from({ length: 3 }) : data?.drift ?? []).map((item, index) => (
              <div
                key={item ? item.title : `drift-${index}`}
                className={
                  loading
                    ? `${skeletonCard} h-20`
                    : 'rounded-xl border border-slate-100 bg-slate-50 px-4 py-3'
                }
              >
                {!loading && item ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy">{item.title}</p>
                      <span className="text-xs text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                  </>
                ) : null}
              </div>
            ))}
          </div>
          <button className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Open Drift Report
          </button>
        </div>
      </section>

      <section className="card px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Import Queue</h3>
            <p className="text-sm text-slate-500">Resources detected in Azure but not fully represented in Bicep.</p>
          </div>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Refresh ARM Scan
          </button>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Resource</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Type</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(loading ? Array.from({ length: 3 }) : data?.importQueue ?? []).map((row, index) => {
                const badgeStyle =
                  row?.state === 'Managed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : row?.state === 'Pending'
                    ? 'bg-amber-100 text-amber-700'
                    : row?.state === 'Drifted'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-700'
                return (
                  <tr key={row ? row.name : `import-${index}`} className="bg-white">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row ? row.name : 'Loading...'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row ? row.type : ''}</td>
                    <td className="px-4 py-3">
                      {row ? <span className={`badge ${badgeStyle}`}>{row.state}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row ? row.action : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">GitHub Actions Pipeline</h3>
          <p className="mt-2 text-sm text-slate-500">
            OIDC-authenticated deployments with explicit environment protection.
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {loading ? (
              <div className={skeletonCard + ' h-20'} />
            ) : data?.githubRuns?.length ? (
              data.githubRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy">{run.name ?? 'Workflow run'}</p>
                    <p className="text-xs text-slate-400">
                      {run.branch ?? 'unknown'} · {run.event ?? 'manual'}
                    </p>
                  </div>
                  <span className={`badge ${statusBadge(run.status, run.conclusion)}`}>
                    {formatRunStatus(run.status, run.conclusion)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No workflow runs found yet.</p>
            )}
          </div>
        </div>
        <div className="card px-6 py-5">
          <h3 className="text-xl font-semibold">Security Posture</h3>
          <p className="mt-2 text-sm text-slate-500">
            No credentials committed. Subscriptions are injected via GitHub secrets.
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Azure subscription IDs</span>
              <span className="badge bg-emerald-100 text-emerald-700">Hidden</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tenant + client secrets</span>
              <span className="badge bg-emerald-100 text-emerald-700">Masked</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Role assignments</span>
              <span className="badge bg-blue-100 text-blue-700">Audited</span>
            </div>
          </div>
        </div>
      </section>

      {showProdConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="card w-full max-w-lg px-6 py-5">
            <h3 className="text-xl font-semibold text-navy">Confirm Production Deployment</h3>
            <p className="mt-2 text-sm text-slate-500">
              This will dispatch the production workflow. Type <strong>CONFIRM</strong> to proceed.
            </p>
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              placeholder="CONFIRM"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setShowProdConfirm(false)
                  setConfirmText('')
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmText !== 'CONFIRM') return
                  setShowProdConfirm(false)
                  setConfirmText('')
                  await handlePromotion()
                }}
                disabled={confirmText !== 'CONFIRM' || actionBusy}
                className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white"
              >
                {actionBusy ? 'Dispatching…' : 'Deploy to Prod'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
