import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { DefaultAzureCredential } from '@azure/identity'
import { ResourceManagementClient } from '@azure/arm-resources'
import { Octokit } from '@octokit/rest'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 4100)
const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID
const githubToken = process.env.GITHUB_TOKEN
const githubOwner = process.env.GITHUB_OWNER
const githubRepo = process.env.GITHUB_REPO
const workflowDev = process.env.GITHUB_WORKFLOW_DEV || 'deploy-dev.yml'
const workflowProd = process.env.GITHUB_WORKFLOW_PROD || 'deploy-prod.yml'
const iacManagedTag = process.env.IAC_MANAGED_TAG || 'iacManaged'
const driftTag = process.env.DRIFT_TAG || 'driftDetected'

if (!subscriptionId) {
  throw new Error('AZURE_SUBSCRIPTION_ID is required in server environment variables.')
}

const credential = new DefaultAzureCredential()
const resourceClient = new ResourceManagementClient(credential, subscriptionId)

app.use(cors({ origin: ['http://localhost:5173'], credentials: false }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'omh-portal-api' })
})

app.get('/api/subscription', (_req, res) => {
  res.json({ subscriptionId })
})

app.get('/api/resource-groups', async (_req, res) => {
  try {
    const groups = [] as { name?: string; location?: string }[]
    for await (const group of resourceClient.resourceGroups.list()) {
      groups.push({ name: group.name, location: group.location })
    }
    res.json({ groups })
  } catch (error) {
    res.status(500).json({ error: 'Failed to list resource groups.' })
  }
})

function extractResourceGroup(id?: string) {
  if (!id) return undefined
  const match = id.match(new RegExp('resourceGroups/([^/]+)', 'i'))
  return match ? match[1] : undefined
}

async function listResourcesByType(resourceType: string) {
  const filter = `resourceType eq '${resourceType}'`
  const results: Array<{
    id?: string
    name?: string
    type?: string
    tags?: Record<string, string>
  }> = []

  for await (const resource of resourceClient.resources.list({ filter })) {
    results.push({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      tags: resource.tags ?? undefined,
    })
  }

  return results
}

app.get('/api/github/runs', async (_req, res) => {
  if (!githubToken || !githubOwner || !githubRepo) {
    res.status(503).json({ error: 'GitHub token or repo settings are not configured.' })
    return
  }

  try {
    const octokit = new Octokit({ auth: githubToken })
    const runs = await octokit.actions.listWorkflowRunsForRepo({
      owner: githubOwner,
      repo: githubRepo,
      per_page: 5,
    })

    res.json({
      runs: runs.data.workflow_runs.map((run) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        htmlUrl: run.html_url,
        event: run.event,
        branch: run.head_branch,
        updatedAt: run.updated_at,
      })),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GitHub Actions runs.' })
  }
})

app.post('/api/github/dispatch', async (req, res) => {
  if (!githubToken || !githubOwner || !githubRepo) {
    res.status(503).json({ error: 'GitHub token or repo settings are not configured.' })
    return
  }

  const { workflow, ref, inputs } = req.body ?? {}
  if (!workflow || !ref) {
    res.status(400).json({ error: 'workflow and ref are required.' })
    return
  }

  const resolvedWorkflow =
    workflow === 'dev' ? workflowDev : workflow === 'prod' ? workflowProd : workflow

  try {
    const octokit = new Octokit({ auth: githubToken })
    await octokit.actions.createWorkflowDispatch({
      owner: githubOwner,
      repo: githubRepo,
      workflow_id: resolvedWorkflow,
      ref,
      inputs,
    })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to dispatch workflow.' })
  }
})

app.get('/api/import-queue', async (_req, res) => {
  try {
    const [containerApps, serviceBus, cosmosDb, acr, managedIdentities] = await Promise.all([
      listResourcesByType('Microsoft.App/containerApps'),
      listResourcesByType('Microsoft.ServiceBus/namespaces'),
      listResourcesByType('Microsoft.DocumentDB/databaseAccounts'),
      listResourcesByType('Microsoft.ContainerRegistry/registries'),
      listResourcesByType('Microsoft.ManagedIdentity/userAssignedIdentities'),
    ])

    const resources = [
      ...containerApps,
      ...serviceBus,
      ...cosmosDb,
      ...acr,
      ...managedIdentities,
    ]

    const rows = resources.map((resource) => {
      const tags = resource.tags ?? {}
      const managed = tags[iacManagedTag]?.toLowerCase() === 'true' || tags.managedBy === 'bicep'
      const drifted = tags[driftTag]?.toLowerCase() === 'true'

      let state: 'Managed' | 'Pending' | 'Drifted' | 'New' = managed ? 'Managed' : 'Pending'
      if (drifted) state = 'Drifted'

      return {
        name: resource.name ?? 'unknown',
        type: resource.type ?? 'unknown',
        state,
        action: managed ? 'No action needed' : drifted ? 'Reconcile in IaC' : 'Import into IaC',
        group: extractResourceGroup(resource.id),
      }
    })

    res.json({ rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import queue.' })
  }
})

app.get('/api/drift', async (_req, res) => {
  try {
    const filter = `tagName eq '${driftTag}' and tagValue eq 'true'`
    const drifted: Array<{ title: string; time: string; detail: string }> = []
    for await (const resource of resourceClient.resources.list({ filter })) {
      drifted.push({
        title: resource.name ?? 'Resource drift detected',
        time: new Date().toISOString(),
        detail: resource.type ?? 'Azure resource',
      })
    }
    res.json({ drift: drifted })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drift data.' })
  }
})

async function countResources(resourceType: string, environment?: string) {
  const filters = [`resourceType eq '${resourceType}'`]
  if (environment) {
    filters.push(`tagName eq 'environment' and tagValue eq '${environment}'`)
  }
  const filter = filters.join(' and ')
  let count = 0
  for await (const _ of resourceClient.resources.list({ filter })) {
    count += 1
  }
  return count
}

app.get('/api/overview', async (req, res) => {
  const environment = typeof req.query.env === 'string' ? req.query.env : undefined
  try {
    const [containerApps, serviceBus, cosmosDb, acr, managedIdentities] = await Promise.all([
      countResources('Microsoft.App/containerApps', environment),
      countResources('Microsoft.ServiceBus/namespaces', environment),
      countResources('Microsoft.DocumentDB/databaseAccounts', environment),
      countResources('Microsoft.ContainerRegistry/registries', environment),
      countResources('Microsoft.ManagedIdentity/userAssignedIdentities', environment),
    ])

    res.json({
      environment: environment ?? 'all',
      counts: {
        containerApps,
        serviceBus,
        cosmosDb,
        acr,
        managedIdentities,
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overview counts.' })
  }
})

app.listen(port, () => {
  console.log(`OMH portal API listening on http://localhost:${port}`)
})
