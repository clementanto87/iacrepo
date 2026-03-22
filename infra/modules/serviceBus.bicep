param environment string
param location string
param namePrefix string

var namespaceName = toLower(replace('${namePrefix}-${environment}-sb', '_', '-'))

resource sbNamespace 'Microsoft.ServiceBus/namespaces@2023-01-01-preview' = {
  name: namespaceName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  tags: {
    environment: environment
    iacManaged: 'true'
  }
}

output namespaceResourceId string = sbNamespace.id
