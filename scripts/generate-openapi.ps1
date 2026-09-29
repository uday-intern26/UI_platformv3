#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
pnpm run contracts:lint
pnpm run contracts:generate
Write-Host "OpenAPI lint + client generation complete."
