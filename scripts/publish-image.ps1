param(
  [Parameter(Mandatory = $true)][string]$DockerHubUser,
  [string]$Version = '1.0.0'
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root
$image = "$DockerHubUser/adoptme-final-backend"

docker build --check .
docker build `
  --build-arg APP_VERSION=$Version `
  --build-arg VCS_REF=(git rev-parse --short HEAD) `
  -t "${image}:${Version}" `
  -t "${image}:latest" .
docker push "${image}:${Version}"
docker push "${image}:latest"
Write-Host "Published ${image}:${Version} and ${image}:latest" -ForegroundColor Green
