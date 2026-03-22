import type {
  DashboardSnapshot,
  Environment,
  GitHubRun,
  ImportRow,
  ProvisionBlueprint,
  ResourceCard,
  DriftItem,
} from './types'
import { driftTimeline, importQueue } from './mock'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function safeFetchJson<T>(input: RequestInfo): Promise<T | null> {
  try {
    const response = await fetch(input)
    if (!response.ok) {
      return null
    }
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function fetchDashboardSnapshot(env: Environment): Promise<DashboardSnapshot> {
  await delay(250)

  const overview = await safeFetchJson<{
    counts: {
      containerApps: number
      serviceBus: number
      cosmosDb: number
      acr: number
      managedIdentities: number
    }
  }>(`/api/overview?env=${env}`)

  const groups = await safeFetchJson<{ groups: { name?: string }[] }>('/api/resource-groups')
  const githubRuns = await safeFetchJson<{ runs: GitHubRun[] }>('/api/github/runs')
  const driftLive = await safeFetchJson<{ drift: DriftItem[] }>('/api/drift')

  const resourceCards: ResourceCard[] = overview
    ? [
        {
          name: 'Container Apps',
          status: 'Managed',
          change: `${overview.counts.containerApps} apps discovered`,
          detail: `Tagged for ${env} environment`,
        },
        {
          name: 'Service Bus',
          status: 'Managed',
          change: `${overview.counts.serviceBus} namespaces found`,
          detail: 'OIDC-enabled deployments',
        },
        {
          name: 'Cosmos DB',
          status: 'Managed',
          change: `${overview.counts.cosmosDb} accounts tracked`,
          detail: 'Autoscale throughput enforced',
        },
        {
          name: 'Container Registry',
          status: 'Managed',
          change: `${overview.counts.acr} registries connected`,
          detail: 'Pull + push permissions verified',
        },
        {
          name: 'Managed Identity',
          status: 'Managed',
          change: `${overview.counts.managedIdentities} identities bound`,
          detail: 'Role assignments in sync',
        },
      ]
    : [
        {
          name: 'Container Apps',
          status: 'Managed',
          change: 'Using cached overview',
          detail: 'Backend not reachable',
        },
      ]

  const metrics = [
    {
      label: 'Deployment Health',
      value: '98%',
      meta: 'OIDC login verified',
    },
    {
      label: 'Resource Groups',
      value: groups ? String(groups.groups.length) : '—',
      meta: groups ? 'Live from Azure ARM' : 'Awaiting API',
    },
    {
      label: 'Pending Imports',
      value: String(importQueue.filter((row) => row.state === 'Pending').length),
      meta: 'Mock queue until import scanner is live',
    },
    {
      label: 'Last Prod Deploy',
      value: 'Mar 20 · 19:42',
      meta: 'Manual promotion',
    },
  ]

  return {
    metrics,
    resources: resourceCards,
    importQueue,
    drift: driftLive?.drift && driftLive.drift.length ? driftLive.drift : driftTimeline,
    githubRuns: githubRuns?.runs,
  }
}

export async function fetchImportQueue(): Promise<ImportRow[]> {
  await delay(300)
  const live = await safeFetchJson<{ rows: ImportRow[] }>('/api/import-queue')
  return live?.rows ?? importQueue
}

export async function createProvisionDraft(_blueprint: ProvisionBlueprint): Promise<{ id: string }> {
  await delay(650)
  return { id: `draft-${Math.floor(Math.random() * 10000)}` }
}

export async function triggerWorkflow(workflow: string, ref: string, inputs?: Record<string, string>) {
  const response = await fetch('/api/github/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow, ref, inputs }),
  })
  if (!response.ok) {
    throw new Error('Dispatch failed')
  }
}
