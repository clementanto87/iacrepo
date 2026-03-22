# OMH Infrastructure Bicep

This folder contains starter Bicep templates for the OMH portal.

## Files
- `main.bicep`: orchestrates all modules
- `modules/managedIdentity.bicep`
- `modules/containerRegistry.bicep`
- `modules/serviceBus.bicep`
- `modules/cosmosDb.bicep`
- `modules/containerApp.bicep`

## Deploy locally (example)
```bash
az deployment group what-if \
  --resource-group <your-rg> \
  --template-file infra/main.bicep \
  --parameters environment=dev namePrefix=omh
```
