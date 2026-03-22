param environment string
param location string
param namePrefix string

var identityName = '${namePrefix}-uai-${environment}'

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: {
    environment: environment
    iacManaged: 'true'
  }
}

output identityResourceId string = identity.id
output identityPrincipalId string = identity.properties.principalId
