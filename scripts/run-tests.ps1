#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "== Node tests =="
pnpm --filter @aijewel/customer-onboarding test
pnpm --filter @aijewel/dashboard-bff test

Write-Host "== Python tests =="
$gw = Join-Path $Root "services\platform\model-gateway"
$pytest = Join-Path $gw ".venv\Scripts\pytest.exe"
& $pytest $gw\tests -q

Write-Host "== Contracts =="
pnpm run contracts:lint

Write-Host "All tests passed." -ForegroundColor Green
