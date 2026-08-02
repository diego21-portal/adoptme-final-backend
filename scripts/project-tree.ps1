$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root
$excluded = @('node_modules', '.git', 'coverage')
Get-ChildItem -Recurse -Force | Where-Object {
  $relative = $_.FullName.Substring($root.Path.Length).TrimStart('\')
  -not ($excluded | Where-Object { $relative -like "$_*" })
} | ForEach-Object {
  $_.FullName.Substring($root.Path.Length).TrimStart('\')
} | Set-Content -Encoding UTF8 'docs/evidence/00-project-tree.txt'
Write-Host 'Tree saved to docs/evidence/00-project-tree.txt'
