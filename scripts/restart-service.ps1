#Requires -Version 5.1
param(
  [Parameter(Mandatory = $true)][string]$Service
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
& (Join-Path $PSScriptRoot "stop-all.ps1")
Start-Sleep -Seconds 1
& (Join-Path $PSScriptRoot "start-all.ps1")
Write-Host "Restarted stack (individual service targeting expands in later phases): $Service"
