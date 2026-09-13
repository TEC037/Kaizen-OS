<#
.SYNOPSIS
    scripts/auto-adelante.ps1
    Inicia el monitor interactivo de auto-adelante con control de insistencia en tiempo real.
#>

param (
    [double]$Idle = 8.0,
    [double]$Cooldown = 6.0,
    [string]$Msg = "adelante",
    [switch]$FilterWindow
)

$scriptPath = Join-Path $PSScriptRoot "auto_adelante.py"

if (Get-Command python -ErrorAction SilentlyContinue) {
    $params = @($scriptPath, "--idle", "$Idle", "--cooldown", "$Cooldown", "--msg", "$Msg")
    if ($FilterWindow) {
        $params += "--filter-window"
    }
    & python @params
} else {
    Write-Host "Error: No se encontró Python en el PATH del sistema." -ForegroundColor Red
}
