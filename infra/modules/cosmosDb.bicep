param environment string
param location string
param namePrefix string
param autoscaleMaxThroughput int

var accountName = toLower(replace('${namePrefix}-${environment}-cosmos', '_', '-'))

resource account 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: accountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    capabilities: []
  }
  tags: {
    environment: environment
    iacManaged: 'true'
  }
}

resource throughput 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/throughputSettings@2023-11-15' = {
  name: '${account.name}/default/sqlDatabase/default'
  properties: {
    resource: {
      autoscaleSettings: {
        maxThroughput: autoscaleMaxThroughput
      }
    }
  }
  dependsOn: [
    account
  ]
}

output accountResourceId string = account.id
