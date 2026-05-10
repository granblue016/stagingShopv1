@echo off
echo ========================================
echo Reset Sample Data for ShopCart
echo ========================================
echo.
echo This will clear existing sample data and reload from data.sql
echo.

echo Stopping backend if running...
taskkill /F /IM java.exe 2>nul

echo Deleting database...
cd /d "%~dp0"
rmdir /s /q backend\target 2>nul

echo Database cleared. Restart backend to reload data.sql
echo.
echo Run: .\start-all.bat
pause
