param environment string = 'dev'
param location string = resourceGroup().location
param namePrefix string = 'omh'
param autoscaleMaxThroughput int = 4000

module managedIdentity './modules/managedIdentity.bicep' = {
  name: '${namePrefix}-identity-${environment}'
  params: {
    environment: environment
    location: location
    namePrefix: namePrefix
  }
}

module containerRegistry './modules/containerRegistry.bicep' = {
  name: '${namePrefix}-acr-${environment}'
  params: {
    environment: environment
    location: location
    namePrefix: namePrefix
    identityResourceId: managedIdentity.outputs.identityResourceId
  }
  dependsOn: [
    managedIdentity
  ]
}

module serviceBus './modules/serviceBus.bicep' = {
  name: '${namePrefix}-sb-${environment}'
  params: {
    environment: environment
    location: location
    namePrefix: namePrefix
  }
}

module cosmosDb './modules/cosmosDb.bicep' = {
  name: '${namePrefix}-cosmos-${environment}'
  params: {
    environment: environment
    location: location
    namePrefix: namePrefix
    autoscaleMaxThroughput: autoscaleMaxThroughput
  }
}

module containerApp './modules/containerApp.bicep' = {
  name: '${namePrefix}-app-${environment}'
  params: {
    environment: environment
    location: location
    namePrefix: namePrefix
    identityResourceId: managedIdentity.outputs.identityResourceId
    registryResourceId: containerRegistry.outputs.registryResourceId
  }
  dependsOn: [
    managedIdentity
    containerRegistry
  ]
}
