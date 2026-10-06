@echo off
title E-Commerce OneUI - Start Application
color 0B
echo ======================================================================
echo    E-Commerce Online Shopping Management System (Samsung One UI)
echo ======================================================================
echo.

set XAMPP_DIR=C:\xampp
set PROJECT_DIR=%~dp0
set FRONTEND_DIR=%PROJECT_DIR%frontend

:: 1. Start MySQL if not already running
echo [1/3] Checking MySQL Database...
netstat -ano | findstr :3306 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo     -- MySQL is already running on port 3306.
) else (
    echo     -- Starting MySQL server from %XAMPP_DIR%\mysql...
    start "" /B "%XAMPP_DIR%\mysql\bin\mysqld.exe" --defaults-file="%XAMPP_DIR%\mysql\bin\my.ini" --standalone
    timeout /t 2 /nobreak >nul
    echo     -- MySQL started.
)

:: 2. Start Apache if not already running
echo.
echo [2/3] Checking Apache Web Server (PHP 8.2)...
netstat -ano | findstr :80 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo     -- Apache is already running on port 80.
) else (
    echo     -- Starting Apache server from %XAMPP_DIR%\apache...
    start "" /B "%XAMPP_DIR%\apache\bin\httpd.exe"
    timeout /t 2 /nobreak >nul
    echo     -- Apache started.
)

:: 3. Start Frontend Dev Server
echo.
echo [3/3] Checking React Frontend Dev Server...
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo     -- Vite Dev Server is already running on port 5173.
) else (
    echo     -- Starting Vite React Frontend on port 5173...
    cd /D "%FRONTEND_DIR%"
    set "PATH=C:\Program Files\nodejs;%PATH%"
    start "Vite Dev Server" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && npm.cmd run dev"
    timeout /t 3 /nobreak >nul
    echo     -- Vite dev server initiated.
)

echo.
echo ======================================================================
echo                     ALL SERVICES ARE LIVE!
echo ======================================================================
echo.
echo  Storefront URL:      http://localhost:5173
echo  Admin Dashboard:     http://localhost:5173/admin
echo  PHP REST API:        http://localhost/ecommerce/backend/api/products/list.php
echo.
echo  Demo Accounts:
echo    - Customer:        customer@ecommerce.local  (Password: Customer@123)
echo    - Admin:           admin@ecommerce.local     (Password: Admin@123)
echo.
echo ======================================================================
echo Opening storefront in your default web browser...
start http://localhost:5173
echo.
echo Press any key to exit this launcher window (services keep running).
pause >nul
