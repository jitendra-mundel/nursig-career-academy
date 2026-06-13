@echo off
REM TheNoecet Notes - Windows Startup Script
REM Usage: Run this batch file to start everything

cls
echo.
echo ╔════════════════════════════════════════╗
echo ║  TheNoecet Notes - Auto Startup       ║
echo ╠════════════════════════════════════════╣
echo ║  Starting backend and frontend...     ║
echo ╚════════════════════════════════════════╝
echo.

REM Kill any existing process on port 5000
echo 🔍 Checking for existing processes on port 5000...
FOR /F "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /PID %%a /F 2>nul
    if not errorlevel 1 (
        echo ✓ Killed existing process on port 5000
    )
)

REM Start Backend in new terminal
echo.
echo 📦 Starting Backend Mock Server on port 5000...
start "TheNoecet Backend" cmd /k "cd backend && node mockServer.js"

REM Wait 3 seconds
timeout /t 3 /nobreak

REM Start Frontend in new terminal
echo 📦 Starting Frontend Dev Server on port 5173...
start "TheNoecet Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers starting...
echo.
echo 🌐 Frontend: http://localhost:5173
echo 📡 Backend: http://localhost:5000
echo.
echo Press Ctrl+C in either terminal to stop
pause
