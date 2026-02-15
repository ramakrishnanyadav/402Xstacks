# x402-Nexus Run Script
# This opens two terminals and starts backend and frontend

Write-Host "`nStarting x402-Nexus...`n" -ForegroundColor Cyan

# Get current directory
$rootDir = Get-Location

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\packages\backend'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\packages\frontend'; npm run dev"

Write-Host "Backend and Frontend starting in separate windows..." -ForegroundColor Green
Write-Host "Wait for both to start, then open: http://localhost:5173`n" -ForegroundColor Yellow
