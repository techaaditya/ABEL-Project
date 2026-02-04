Write-Host "Starting ABEL Java Backend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot/java"

if (Get-Command "mvn" -ErrorAction SilentlyContinue) {
    Write-Host "Global Maven found." -ForegroundColor Green
    mvn "clean" "compile" "exec:java" "-Dexec.mainClass=com.abel.Main"
} else {
    # Check for local portable Maven
    $LocalMaven = "$PSScriptRoot\java\build_tools\apache-maven-3.9.6\bin\mvn.cmd"
    if (Test-Path $LocalMaven) {
        Write-Host "Using Local Portable Maven..." -ForegroundColor Green
        & $LocalMaven "clean" "compile" "exec:java" "-Dexec.mainClass=com.abel.Main"
    } else {
        Write-Host "CRITICAL ERROR: 'mvn' is not installed." -ForegroundColor Red
        Write-Host "Running auto-setup..." -ForegroundColor Yellow
        & "$PSScriptRoot\setup_maven.ps1"
        
        if (Test-Path $LocalMaven) {
             & $LocalMaven "clean" "compile" "exec:java" "-Dexec.mainClass=com.abel.Main"
        } else {
             Write-Host "Setup failed. Please install Maven manually." -ForegroundColor Red
        }
    }
}
