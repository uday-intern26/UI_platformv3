#Requires -Version 5.1
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
$pidsFile = Join-Path $Root "pids.json"

if (-not (Test-Path $pidsFile)) {
  Write-Host "No pids.json found - nothing to stop."
  exit 0
}

$pids = Get-Content $pidsFile | ConvertFrom-Json
foreach ($prop in $pids.PSObject.Properties) {
  $name = $prop.Name
  $procId = $prop.Value.pid
  try {
    Stop-Process -Id $procId -Force -ErrorAction Stop
    Write-Host "Stopped $name (PID $procId)"
  } catch {
    Write-Host "Already stopped: $name (PID $procId)"
  }
}

foreach ($port in 3001, 5003, 8101) {
  $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($opid in $conns) {
    if ($opid -and $opid -ne 0) {
      try { Stop-Process -Id $opid -Force -ErrorAction SilentlyContinue } catch {}
    }
  }
}

Remove-Item $pidsFile -Force -ErrorAction SilentlyContinue
Write-Host "All tracked services stopped."
