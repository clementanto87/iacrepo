export const navigation = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'provision', label: 'Provision', path: '/provision' },
  { id: 'import', label: 'Import', path: '/import' },
  { id: 'promote', label: 'Promote', path: '/promote' },
  { id: 'drift', label: 'Drift Monitor', path: '/drift' },
  { id: 'settings', label: 'Settings', path: '/settings' },
]

export const resourceCards = [
  {
    name: 'Container Apps',
    status: 'Managed',
    change: '+2 pending revisions',
    detail: '14 apps in dev, 10 in prod',
  },
  {
    name: 'Service Bus',
    status: 'Managed',
    change: 'All namespaces aligned',
    detail: '3 namespaces across environments',
  },
  {
    name: 'Cosmos DB',
    status: 'Pending Import',
    change: 'Autoscale drift detected',
    detail: '2 accounts require baselining',
  },
  {
    name: 'Container Registry',
    status: 'Managed',
    change: 'Prod auth verified',
    detail: 'OIDC federated identity active',
  },
  {
    name: 'Managed Identity',
    status: 'Managed',
    change: 'Role bindings stable',
    detail: '3 roles across 5 scopes',
  },
]

export const importQueue = [
  {
    name: 'omh-cosmos-prod',
    type: 'Cosmos DB',
    state: 'Pending',
    action: 'Import into IaC',
  },
  {
    name: 'omh-acr-prod',
    type: 'Container Registry',
    state: 'Managed',
    action: 'No action needed',
  },
  {
    name: 'omh-servicebus-dev',
    type: 'Service Bus',
    state: 'New',
    action: 'Provision in dev',
  },
  {
    name: 'omh-api-ca-prod',
    type: 'Container App',
    state: 'Drifted',
    action: 'Reconcile revision',
  },
]

export const driftTimeline = [
  {
    title: 'Cosmos DB throughput mismatch',
    time: '12 minutes ago',
    detail: 'autoscaleMaxThroughput differs from exported value',
  },
  {
    title: 'Container App revision stale',
    time: '48 minutes ago',
    detail: 'dev revision not promoted to prod',
  },
  {
    title: 'ACR push permissions verified',
    time: '2 hours ago',
    detail: 'OIDC federated identity updated',
  },
]

export const metrics = [
  { label: 'Deployment Health', value: '98%', meta: 'No failed runs in 7 days' },
  { label: 'Pending Imports', value: '2', meta: 'Cosmos DB + Service Bus' },
  { label: 'Drift Alerts', value: '1', meta: 'Autoscale throughput' },
  { label: 'Last Prod Deploy', value: 'Mar 20 · 19:42', meta: 'Manual promotion' },
]
