$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

$nodeVersion = node --version
if ($nodeVersion -notmatch '^v24\.') {
  throw "Node.js 24 LTS is required. Current version: $nodeVersion"
}

Write-Host 'Generating a reproducible package-lock.json...' -ForegroundColor Cyan
npm install --package-lock-only --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'package-lock generation failed' }

Write-Host 'Installing locked dependencies...' -ForegroundColor Cyan
npm ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }

Write-Host 'Running complete quality gate...' -ForegroundColor Cyan
npm run check
if ($LASTEXITCODE -ne 0) { throw 'Quality gate failed' }

Write-Host 'Repository prepared. Commit package-lock.json before publishing.' -ForegroundColor Green
