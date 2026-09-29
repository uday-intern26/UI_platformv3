# AIJewel Enterprise AI Platform

Multi-tenant, API-first backend for the AIJewel.in Enterprise AI Platform.
Local-first development on Windows; independently deployable to AWS Lambda later.

## Scope (approved)

| Domain | Count | Notes |
|--------|------:|-------|
| Business Applications | 8 | Excludes Marketing Automation & Sales Agent/CRM |
| Enterprise AI Platform | 9 | Includes generic Agent Runtime |
| Enterprise Administration | 8 | Includes Customer Onboarding & SaaS Pricing |
| Dashboard BFF + Global Search | 1 | |

## Prerequisites

- Windows 11
- Python 3.12+ (3.13 OK if 3.12 unavailable)
- Node.js 22+
- pnpm 9+
- Docker Desktop (optional, for DynamoDB Local / MinIO)

## Quick start (Milestone 1)

```powershell
cd D:\Intern\AIJewel
.\scripts\setup-local.ps1
.\scripts\start-all.ps1
.\scripts\check-health.ps1
```

Services:

| Service | Port | Health |
|---------|-----:|--------|
| Dashboard BFF | 3001 | http://127.0.0.1:3001/health |
| Customer Onboarding | 5003 | http://127.0.0.1:5003/health |
| Model Gateway | 8101 | http://127.0.0.1:8101/health |
| Model Gateway Swagger | 8101 | http://127.0.0.1:8101/docs |

Mint a local JWT and call APIs:

```powershell
$TOKEN = (node scripts/mint-dev-token.mjs).Trim()
Invoke-RestMethod -Headers @{ Authorization = "Bearer $TOKEN" } http://127.0.0.1:3001/v1/dashboard/summary
```

## Repository layout

See the specification under `docs/architecture/`. Contracts live in `contracts/openapi`.
Each Python service owns an independent `.venv`. Node services use the pnpm workspace.

## Implementation status

See [docs/STATUS.md](docs/STATUS.md). Mocked AI inference is explicitly marked `mocked: true`.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/setup-local.ps1` | Create venvs, install deps, lint/generate contracts |
| `scripts/start-all.ps1` | Start Milestone 1 services |
| `scripts/stop-all.ps1` | Stop tracked processes |
| `scripts/check-health.ps1` | Probe health endpoints |
| `scripts/run-tests.ps1` | Unit + contract tests |
| `scripts/generate-openapi.ps1` | Lint + generate TS clients |

## AWS

CDK stubs go under `infrastructure/cdk`. **Do not deploy during local development.**
No AWS credentials are required to run locally.
