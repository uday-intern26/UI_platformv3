#Requires -Version 5.1
$ErrorActionPreference = "Continue"
$targets = @(
  @{ name = "dashboard-bff"; url = "http://127.0.0.1:3001/health" },
  @{ name = "customer-onboarding"; url = "http://127.0.0.1:5003/health" },
  @{ name = "model-gateway"; url = "http://127.0.0.1:8101/health" }
)

$failed = 0
foreach ($t in $targets) {
  try {
    $res = Invoke-RestMethod -Uri $t.url -TimeoutSec 3
    Write-Host ("OK   {0,-22} {1}" -f $t.name, ($res | ConvertTo-Json -Compress))
  } catch {
    $failed += 1
    Write-Host ("FAIL {0,-22} {1}" -f $t.name, $_.Exception.Message) -ForegroundColor Red
  }
}

if ($failed) { exit 1 }
