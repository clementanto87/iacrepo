export type Environment = 'dev' | 'prod'

export type Metric = {
  label: string
  value: string
  meta: string
}

export type ResourceCard = {
  name: string
  status: 'Managed' | 'Pending Import' | 'Drifted' | 'New'
  change: string
  detail: string
}

export type ImportRow = {
  name: string
  type: string
  state: 'Managed' | 'Pending' | 'Drifted' | 'New'
  action: string
}

export type DriftItem = {
  title: string
  time: string
  detail: string
}

export type GitHubRun = {
  id: number
  name?: string | null
  status: string
  conclusion?: string | null
  htmlUrl?: string | null
  event?: string | null
  branch?: string | null
  updatedAt?: string | null
}

export type ProvisionBlueprint = {
  resourceType: string
  environment: Environment
  prefix: string
}

export type DashboardSnapshot = {
  metrics: Metric[]
  resources: ResourceCard[]
  importQueue: ImportRow[]
  drift: DriftItem[]
  githubRuns?: GitHubRun[]
}
