param environment string
param location string
param namePrefix string
param identityResourceId string

var appName = '${namePrefix}-app-${environment}'

resource containerEnv 'Microsoft.App/managedEnvironments@2023-05-02-preview' = {
  name: '${namePrefix}-env-${environment}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
    }
  }
  tags: {
    environment: environment
    iacManaged: 'true'
  }
}

resource containerApp 'Microsoft.App/containerApps@2023-05-02-preview' = {
  name: appName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityResourceId}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      registries: [
        {
          server: '${namePrefix}${environment}acr.azurecr.io'
          identity: identityResourceId
        }
      ]
    }
    template: {
      containers: [
        {
          name: appName
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: 1
            memory: '1Gi'
          }
        }
      ]
    }
  }
  tags: {
    environment: environment
    iacManaged: 'true'
  }
  dependsOn: [
    containerEnv
  ]
}

output appResourceId string = containerApp.id
