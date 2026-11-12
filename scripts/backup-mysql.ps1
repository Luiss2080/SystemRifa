param(
  [string]$DbHost = "127.0.0.1",
  [int]$DbPort = 3306,
  [string]$DbUser = "root",
  [string]$DbPassword = "",
  [string]$DbName = "rifas",
  [string]$BackupDir = "$PSScriptRoot\..\backups",
  [int]$KeepLast = 7
)

$ErrorActionPreference = "Stop"

$mysqldumpCmd = Get-Command mysqldump -ErrorAction SilentlyContinue
if (-not $mysqldumpCmd) {
  $laragonDump = Get-ChildItem "C:\laragon\bin\mysql" -Recurse -Filter "mysqldump.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($laragonDump) {
    $mysqldumpPath = $laragonDump.FullName
  } else {
    throw "No se encontró mysqldump en el PATH ni en C:\laragon\bin\mysql."
  }
} else {
  $mysqldumpPath = $mysqldumpCmd.Source
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = Join-Path $BackupDir "${DbName}_${timestamp}.sql"

$args = @(
  "--host=$DbHost",
  "--port=$DbPort",
  "--user=$DbUser",
  "--single-transaction",
  "--routines",
  "--triggers",
  $DbName
)

if ($DbPassword -ne "") {
  $env:MYSQL_PWD = $DbPassword
}

try {
  & $mysqldumpPath @args | Out-File -FilePath $outFile -Encoding utf8
  if ($LASTEXITCODE -ne 0) {
    throw "mysqldump falló con código $LASTEXITCODE"
  }
} finally {
  Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue
}

# Rotación automática manteniendo los últimos $KeepLast respaldos
$oldBackups = Get-ChildItem -Path $BackupDir -Filter "${DbName}_*.sql" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -Skip $KeepLast

foreach ($file in $oldBackups) {
  Remove-Item $file.FullName -Force
}

Write-Host "Respaldo generado correctamente: $outFile"

