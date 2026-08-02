param(
  [string]$DockerHubUser = 'local',
  [string]$Version = '1.0.0',
  [string]$ComposeFile = 'compose.legacy-cpu.yaml'
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$evidence = Join-Path $root 'docs/evidence'
New-Item -ItemType Directory -Force -Path $evidence | Out-Null
Set-Location $root

function Run-And-Save([string]$Name, [scriptblock]$Command) {
  Write-Host "`n=== $Name ===" -ForegroundColor Cyan

  # Windows PowerShell 5.1 converts text written by native programs to STDERR
  # (for example, harmless npm warnings) into ErrorRecord objects. With the
  # global ErrorActionPreference set to Stop, that can interrupt the script
  # even when the native command exits successfully. Capture the complete
  # output and decide success only from the real native exit code.
  $previousErrorActionPreference = $ErrorActionPreference
  $output = $null
  $exitCode = 0

  try {
    $ErrorActionPreference = 'Continue'
    $output = & $Command 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  $output | Tee-Object -FilePath (Join-Path $evidence $Name)

  if ($null -eq $exitCode) {
    $exitCode = 0
  }

  if ($exitCode -ne 0) {
    throw "Command failed: $Name (exit code $exitCode)"
  }
}

function Stop-ProjectNodeProcesses {
  $rootText = [string]$root
  $processes = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.CommandLine -and $_.CommandLine.IndexOf($rootText, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    }

  foreach ($process in $processes) {
    Write-Warning "Closing Node process $($process.ProcessId) that is using this project."
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

function Remove-NodeModulesWithRetry {
  if (-not (Test-Path 'node_modules')) {
    return
  }

  Stop-ProjectNodeProcesses

  for ($attempt = 1; $attempt -le 5; $attempt++) {
    try {
      Write-Host "Removing node_modules (attempt $attempt/5)..." -ForegroundColor Yellow
      Remove-Item -LiteralPath 'node_modules' -Recurse -Force -ErrorAction Stop
      return
    } catch {
      if ($attempt -eq 5) {
        break
      }
      Start-Sleep -Seconds 2
    }
  }

  Write-Host 'PowerShell could not remove node_modules. Trying Windows rmdir...' -ForegroundColor Yellow
  cmd.exe /d /c 'rmdir /s /q "node_modules"'

  if (Test-Path 'node_modules') {
    throw @"
Windows is still locking node_modules.
Close VS Code terminals, stop running Node servers, close File Explorer windows opened inside node_modules,
and run this script again. If necessary, restart Windows and run it before opening the project.
"@
  }
}

if (-not (Test-Path 'package-lock.json')) {
  Run-And-Save '00-package-lock-generation.txt' {
    npm.cmd install --package-lock-only --ignore-scripts
  }
}

Run-And-Save '01-tool-versions.txt' {
  node --version
  npm --version
  git --version
  docker --version
  docker compose version
}

Write-Host "`nPreparing a clean npm installation..." -ForegroundColor Cyan
Remove-NodeModulesWithRetry
Run-And-Save '01b-npm-cache-verify.txt' { npm.cmd cache verify }
Run-And-Save '02-npm-ci.txt' { npm.cmd ci }
Run-And-Save '03-lint.txt' { npm.cmd run lint }
Run-And-Save '04-tests-coverage.txt' { npm.cmd run test:coverage }
Run-And-Save '05-core-smoke.txt' { npm.cmd run smoke:core }
Run-And-Save '06-npm-audit-production.txt' { npm.cmd run audit:prod }
Run-And-Save '07-docker-build-check.txt' { docker build --check . }
Run-And-Save '08-docker-build.txt' {
  docker build `
    --build-arg APP_VERSION=$Version `
    --build-arg VCS_REF=local `
    -t "${DockerHubUser}/adoptme-final-backend:${Version}" `
    -t "${DockerHubUser}/adoptme-final-backend:latest" .
}
if (-not (Test-Path $ComposeFile)) {
  throw "Compose file not found: $ComposeFile"
}

Run-And-Save '08b-compose-cleanup.txt' {
  docker compose -f $ComposeFile down -v --remove-orphans
}
Run-And-Save '09-compose-up.txt' {
  docker compose -f $ComposeFile up --build --force-recreate -d
}

$healthy = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
  try {
    $response = Invoke-RestMethod http://localhost:8080/health -TimeoutSec 3
    if ($response.status -eq 'success') {
      $healthy = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}
if (-not $healthy) {
  docker compose -f $ComposeFile logs --no-color | Set-Content -Encoding UTF8 (Join-Path $evidence '09b-compose-failure-logs.txt')
  throw 'API did not become healthy. See docs/evidence/09b-compose-failure-logs.txt.'
}

Run-And-Save '10-docker-compose-ps.txt' { docker compose -f $ComposeFile ps }
Run-And-Save '11-api-logs.txt' { docker compose -f $ComposeFile logs --no-color api }
Run-And-Save '11a-mongo-logs.txt' { docker compose -f $ComposeFile logs --no-color mongo }
$health = Invoke-RestMethod http://localhost:8080/health
$health | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $evidence '12-health-check.json')
$openApi = Invoke-RestMethod http://localhost:8080/docs.json
$openApi | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 (Join-Path $evidence '13-openapi.json')
Run-And-Save '14-docker-image-inspect.txt' {
  docker image inspect "${DockerHubUser}/adoptme-final-backend:${Version}"
}

try {
  Run-And-Save '15-docker-scout-quickview.txt' {
    docker scout quickview "${DockerHubUser}/adoptme-final-backend:${Version}"
  }
  Run-And-Save '16-docker-scout-cves.txt' {
    docker scout cves "${DockerHubUser}/adoptme-final-backend:${Version}"
  }
} catch {
  $_ | Out-String | Set-Content -Encoding UTF8 (Join-Path $evidence '15-docker-scout-unavailable.txt')
  Write-Warning 'Docker Scout was not available. The reason was saved as evidence.'
}

Write-Host "`nVerification complete using $ComposeFile. Evidence saved in docs/evidence." -ForegroundColor Green
