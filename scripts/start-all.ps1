#Requires -Version 5.1
<#
.SYNOPSIS
  Start Milestone-1 local services (Onboarding, Model Gateway, Dashboard BFF).
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$pidsFile = Join-Path $Root "pids.json"
$logs = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $logs | Out-Null

if (Test-Path (Join-Path $Root ".env")) {
  Get-Content (Join-Path $Root ".env") | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $parts = $_ -split '=', 2
    if ($parts.Length -eq 2) {
      [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
  }
}

# Free known ports from a previous partial start
foreach ($port in 3001, 5003, 8101) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object {
      if ($_ -and $_ -ne 0) {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
      }
    }
}

$started = @{}
$pnpmCmdInfo = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if ($pnpmCmdInfo) { $pnpmCmd = $pnpmCmdInfo.Source } else { $pnpmCmd = "pnpm.cmd" }

function Start-LoggedProcess($name, $filePath, $argumentList, $workingDirectory) {
  $stdout = Join-Path $logs "$name.out.log"
  $stderr = Join-Path $logs "$name.err.log"
  $p = Start-Process -FilePath $filePath -ArgumentList $argumentList `
    -WorkingDirectory $workingDirectory -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $stdout -RedirectStandardError $stderr
  $started[$name] = @{ pid = $p.Id; port = $null }
  Write-Host "Started $name (PID $($p.Id))"
  return $p
}

# Model Gateway (Python)
$gw = Join-Path $Root "services\platform\model-gateway"
$uvicorn = Join-Path $gw ".venv\Scripts\uvicorn.exe"
if (-not (Test-Path $uvicorn)) {
  throw "model-gateway venv missing. Run .\scripts\setup-local.ps1 first."
}
Start-LoggedProcess "model-gateway" $uvicorn @(
  "app.main:app", "--host", "0.0.0.0", "--port", "8101"
) $gw | Out-Null
$started["model-gateway"].port = 8101

# Customer Onboarding (Node via pnpm.cmd)
Start-LoggedProcess "customer-onboarding" $pnpmCmd @(
  "--filter", "@aijewel/customer-onboarding", "dev"
) $Root | Out-Null
$started["customer-onboarding"].port = 5003

# Dashboard BFF
Start-LoggedProcess "dashboard-bff" $pnpmCmd @(
  "--filter", "@aijewel/dashboard-bff", "dev"
) $Root | Out-Null
$started["dashboard-bff"].port = 3001

($started | ConvertTo-Json -Depth 4) | Set-Content $pidsFile

Write-Host "Waiting for health checks..."
Start-Sleep -Seconds 8
& (Join-Path $PSScriptRoot "check-health.ps1")

Write-Host "`nMilestone-1 services started." -ForegroundColor Green
Write-Host "  Dashboard BFF:        http://127.0.0.1:3001/health"
Write-Host "  Customer Onboarding:  http://127.0.0.1:5003/health"
Write-Host "  Model Gateway:        http://127.0.0.1:8101/health"
Write-Host "  Model Gateway docs:   http://127.0.0.1:8101/docs"
