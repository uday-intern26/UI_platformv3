#Requires -Version 5.1
<#
.SYNOPSIS
  Bootstrap AIJewel local development environment (Windows).
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "== AIJewel setup-local ==" -ForegroundColor Cyan

# Versions
$node = node --version
$python = python --version
Write-Host "Node: $node"
Write-Host "Python: $python"
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw "pnpm is required. Install with: npm install -g pnpm"
}

# Env
$envExample = Join-Path $Root "infrastructure\local\.env.example"
$envTarget = Join-Path $Root ".env"
if (-not (Test-Path $envTarget)) {
  Copy-Item $envExample $envTarget
  Write-Host "Created .env from example"
}

# Data dirs
@(
  "data\dynamodb",
  "data\storage",
  "data\storage\onboarding",
  "data\chroma",
  "logs"
) | ForEach-Object {
  New-Item -ItemType Directory -Force -Path (Join-Path $Root $_) | Out-Null
}

# Node deps
Write-Host "Installing Node workspace dependencies..."
pnpm install

# Frontend UI (Vite / npm)
$fe = Join-Path $Root "frontend"
if (Test-Path (Join-Path $fe "package.json")) {
  Write-Host "Installing frontend dependencies..."
  Push-Location $fe
  npm install
  Pop-Location
}

# Shared python package + model-gateway venv
$gw = Join-Path $Root "services\platform\model-gateway"
$venv = Join-Path $gw ".venv"
if (-not (Test-Path $venv)) {
  Write-Host "Creating model-gateway .venv"
  python -m venv $venv
}
$pip = Join-Path $venv "Scripts\pip.exe"
$py = Join-Path $venv "Scripts\python.exe"
& $py -m pip install --upgrade pip
& $pip install -r (Join-Path $gw "requirements.txt")
& $pip install -e (Join-Path $Root "packages\shared-python")

# Build shared-node
pnpm --filter @aijewel/shared-node build

# Contracts
pnpm run contracts:lint
pnpm run contracts:generate

Write-Host "`nSetup complete. Next: .\scripts\start-all.ps1" -ForegroundColor Green
