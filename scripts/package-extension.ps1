param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$ReleaseDirName = "release"
)

$ErrorActionPreference = "Stop"

$manifestPath = Join-Path $ProjectRoot "manifest.json"
if (-not (Test-Path $manifestPath)) {
  throw "manifest.json not found at $manifestPath"
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
if (-not $version) {
  throw "manifest.json does not contain a version."
}

$manifestName = $manifest.name
if (-not $manifestName) {
  throw "manifest.json does not contain a name."
}

$zipBaseName = $manifestName.ToLowerInvariant()
$zipBaseName = [System.Text.RegularExpressions.Regex]::Replace($zipBaseName, "[^a-z0-9]+", "-")
$zipBaseName = $zipBaseName.Trim("-")
if (-not $zipBaseName) {
  throw "Could not derive ZIP base name from manifest name."
}

$releaseDir = Join-Path $ProjectRoot $ReleaseDirName
$stageDir = Join-Path $releaseDir "staging"
$zipName = "$zipBaseName-v$version.zip"
$zipPath = Join-Path $releaseDir $zipName

if (Test-Path $stageDir) {
  Remove-Item -Recurse -Force $stageDir
}

if (-not (Test-Path $releaseDir)) {
  New-Item -ItemType Directory -Path $releaseDir | Out-Null
}

New-Item -ItemType Directory -Path $stageDir | Out-Null

$filesToCopy = @(
  "manifest.json",
  "popup.html",
  "popup.js",
  "popup.css",
  "README.md",
  "PRIVACY.md"
)

foreach ($file in $filesToCopy) {
  $source = Join-Path $ProjectRoot $file
  if (Test-Path $source) {
    Copy-Item -Path $source -Destination $stageDir -Force
  }
}

$dirsToCopy = @("dist", "icons")
foreach ($dir in $dirsToCopy) {
  $source = Join-Path $ProjectRoot $dir
  if (-not (Test-Path $source)) {
    throw "Required directory missing: $source"
  }
  Copy-Item -Path $source -Destination $stageDir -Recurse -Force
}

# Strip sourcemaps from release package.
$distStagePath = Join-Path $stageDir "dist"
if (Test-Path $distStagePath) {
  Get-ChildItem -Path $distStagePath -Filter "*.map" -Recurse | Remove-Item -Force
}

if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

Compress-Archive -Path (Join-Path $stageDir "*") -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $stageDir

Write-Output "Created release package: $zipPath"
