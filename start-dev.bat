@echo off
REM Start Development Environment for PAZ Thriving Tribe
REM This batch file starts both the Vite dev server and API dev server

echo.
echo ════════════════════════════════════════════════════════════
echo  PAZ Thriving Tribe - Development Environment Starter
echo ════════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Start API Dev Server in a new window
echo Starting API Development Server (port 3001)...
start "PAZ API Dev Server" cmd /k "node api-dev-server.js"

REM Wait a bit for API server to start
timeout /t 2 /nobreak

REM Start Vite Dev Server
echo Starting Vite Development Server (port 5173)...
npm run dev

pause
