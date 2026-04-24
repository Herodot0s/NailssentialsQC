# NailssentialsQC - Dev Launch Script

Write-Host "Starting NailssentialsQC System..." -ForegroundColor Cyan

# 1. Start Backend
Write-Host "Launching Backend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "cd backend; npm run dev"

# 2. Start Frontend
Write-Host "Launching Frontend (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "cd frontend; npm run dev"

Write-Host "System is starting up. Please wait for the ports to be ready." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"
