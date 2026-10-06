@echo off
title ClauseLens Launcher
echo ==================================================
echo   ClauseLens AI Legal Contract Audit Launcher
echo ==================================================
echo.
echo Starting FastAPI Backend Server on http://localhost:8000 ...
start "ClauseLens Backend (FastAPI)" cmd /k "cd /d "%~dp0Backend" && python main.py"

echo Starting Vite React Frontend Server on http://localhost:5173 ...
start "ClauseLens Frontend (Vite)" cmd /k "cd /d "%~dp0Frontend" && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 3 >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ==================================================
echo   ClauseLens is running!
echo   Backend API:  http://localhost:8000/api/health
echo   Frontend UI:  http://localhost:5173
echo ==================================================
echo Press any key to close this launcher (servers will keep running in separate windows)...
pause >nul
