# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Azure OIDC Setup

This repo includes a workflow at `.github/workflows/azure-oidc-check.yml` that verifies GitHub Actions OIDC login to Azure.

Required GitHub Actions secrets:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

Run the workflow manually from the Actions tab or push to `main`.

## Deploy Workflows

Two workflows are provided:
- `deploy-dev.yml` (push to `main` or manual dispatch)
- `deploy-prod.yml` (manual dispatch only, requires confirm input)

Inputs (optional):
- `resource_group`
- `template_file`
- `parameters_file`
- `parameters_json`

## Bicep Scaffolding

Starter templates are in `infra/`:
- `infra/main.bicep`
- `infra/modules/*`
- `infra/parameters/dev.json`
- `infra/parameters/prod.json`

## Local Azure ARM API (Server)

There is a small API server under `server/` that proxies Azure ARM data for the UI.

1. Copy `server/.env.example` to `server/.env` and set `AZURE_SUBSCRIPTION_ID`.
2. Add a GitHub personal access token in `server/.env` as `GITHUB_TOKEN`.
   - Required permissions: Actions (read + write) and Contents (read)
3. Set `GITHUB_OWNER` and `GITHUB_REPO` to match your repo (e.g. `clementanto87` / `iacrepo`).
4. Optionally set workflow file names with `GITHUB_WORKFLOW_DEV` and `GITHUB_WORKFLOW_PROD`.
5. Run the server:
   - `cd server`
   - `npm install`
   - `npm run dev`
6. In another terminal, run the UI:
   - `npm run dev`

Vite proxies `/api` to `http://localhost:4100`.

### Resource Tagging (Import & Drift)

The server uses tags to classify resources:
- Managed in IaC: `iacManaged=true` (configurable via `IAC_MANAGED_TAG`)
- Drift detected: `driftDetected=true` (configurable via `DRIFT_TAG`)

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
