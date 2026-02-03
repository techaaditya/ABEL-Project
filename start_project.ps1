Write-Host "Checking ABEL Project Environment..." -ForegroundColor Cyan

# 1. Check Ports (basic check)
function Test-Port($port, $name) {
    if (Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet) {
        Write-Host "[$name] Port $port is OPEN - OK" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[$name] Port $port is CLOSED - Action Required" -ForegroundColor Red
        return $false
    }
}

$apache = Test-Port 80 "Apache (Web Server)"
$mysql = Test-Port 3306 "MySQL (Database)"
$neo4j = Test-Port 7687 "Neo4j (Graph DB)"

if (-not ($apache -and $mysql)) {
    Write-Host "Please start Apache and MySQL in XAMPP Control Panel." -ForegroundColor Yellow
}

if (-not $neo4j) {
    Write-Host "Please start your Database in Neo4j Desktop." -ForegroundColor Yellow
}

# 2. Check Python Dependencies (Quick verify)
Write-Host "`nVerifying Python Environment..." -ForegroundColor Cyan
if (Test-Path ".venv") {
    Write-Host "Virtual environment found." -ForegroundColor Green
} else {
    Write-Host "Warning: .venv not found. Ensure you have configured the python environment." -ForegroundColor Yellow
}

# 3. Start Server
Write-Host "`nStarting Python AI Server..." -ForegroundColor Cyan
Write-Host "Connecting to REMOTE Neo4j Database (13.219.228.76). Local Neo4j check skipped." -ForegroundColor Cyan

Write-Host "This window will remain open to run the Python backend." -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray

# Activate venv and run
& ".\.venv\Scripts\python.exe" "python_ai\server.py"
