@echo off
title E-Commerce OneUI - Stop Application
color 0C
echo ======================================================================
echo    Stopping E-Commerce System Services
echo ======================================================================
echo.

echo [1/3] Stopping Apache httpd...
taskkill /F /IM httpd.exe >nul 2>&1
echo     -- Apache stopped.

echo [2/3] Stopping Vite Dev Server (Node)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo     -- Vite server stopped.

echo [3/3] Stopping MySQL (Optional: leave running if needed for other apps)...
choice /M "Do you also want to stop the MySQL server"
if %ERRORLEVEL% equ 1 (
    taskkill /F /IM mysqld.exe >nul 2>&1
    echo     -- MySQL stopped.
) else (
    echo     -- MySQL left running.
)

echo.
echo All requested services have been stopped.
timeout /t 3 >nul
