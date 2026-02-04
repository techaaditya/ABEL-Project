# Set download parameters
$MavenVersion = "3.9.6"
$MavenUrl = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
$InstallDir = "$PSScriptRoot\java\build_tools"
$MavenZip = "$InstallDir\maven.zip"
$MavenHome = "$InstallDir\apache-maven-$MavenVersion"
$MavenBin = "$MavenHome\bin\mvn.cmd"

Write-Host "Setting up Portable Maven for ABEL Project..." -ForegroundColor Cyan

# 1. Create Directory
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

# 2. Check if already installed
if (Test-Path $MavenBin) {
    Write-Host "Maven is already installed at $MavenHome" -ForegroundColor Green
    exit 0
}

# 3. Download Maven
Write-Host "Downloading Maven $MavenVersion..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $MavenUrl -OutFile $MavenZip -UseBasicParsing
} catch {
    Write-Host "Failed to download Maven. check internet connection." -ForegroundColor Red
    exit 1
}

# 4. Extract
Write-Host "Extracting Maven..." -ForegroundColor Yellow
Expand-Archive -Path $MavenZip -DestinationPath $InstallDir -Force

# 5. Cleanup
Remove-Item $MavenZip -Force

# 6. Verify
if (Test-Path $MavenBin) {
    Write-Host "Maven successfully setup at: $MavenBin" -ForegroundColor Green
    Write-Host "You can now run './run_java_backend.ps1' to start the server." -ForegroundColor Cyan
} else {
    Write-Host "Extraction failed. verify $InstallDir" -ForegroundColor Red
}
