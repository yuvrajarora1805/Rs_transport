@echo off
title RS Transport ERP - Launcher
color 0B

echo ===================================================
echo           RS TRANSPORT ERP - DESKTOP CLIENT
echo           Offline-First Weighbridge Edition
echo ===================================================
echo.

:: 1. Check or start MySQL
echo [*] Checking local MySQL service on port 3306...
netstat -ano | findstr 3306 >nul
if %errorlevel% equ 0 (
    echo [OK] MySQL is active.
) else (
    echo [!] MySQL not running on port 3306.
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        echo [*] Starting XAMPP MySQL daemon...
        start "" /b "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 3 /nobreak >nul
    ) else (
        echo [WARN] Please start MySQL in XAMPP Control Panel.
    )
)

:: 2. Start Backend
echo [*] Launching RS Transport Backend (Port 4000)...
cd /d "%~dp0..\backend"
start "RS Transport Backend" /min cmd /c "npm run start:prod"

:: 3. Start Frontend
echo [*] Launching RS Transport Frontend (Port 3000)...
cd /d "%~dp0..\frontend"
start "RS Transport Frontend" /min cmd /c "npm run start"

:: 4. Wait for web services to be ready
echo [*] Waiting for ERP services to initialize...
timeout /t 4 /nobreak >nul

:: 5. Open in dedicated clean App Window (Edge or Chrome)
echo [*] Launching dedicated Desktop Window...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:3000" --start-maximized
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000" --start-maximized
) else (
    start http://localhost:3000
)

echo.
echo [DONE] RS Transport ERP is running!
echo You can minimize this window.
timeout /t 5 >nul
exit
