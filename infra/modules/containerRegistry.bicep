param environment string
param location string
param namePrefix string
param identityResourceId string

var registryName = toLower(replace('${namePrefix}${environment}acr', '-', ''))

resource registry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityResourceId}': {}
    }
  }
  tags: {
    environment: environment
    iacManaged: 'true'
  }
}

output registryResourceId string = registry.id
