@echo off
echo ========================================
echo Reset Database - ShopCart AI
echo ========================================
echo.

echo Stopping any running services...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 3 >nul

echo.
echo Connecting to PostgreSQL...
echo.

REM Database configuration (from application.properties)
set DB_NAME=shopcart_db
set DB_USER=postgres
set DB_PASSWORD=admin
set DB_PORT=5432

echo Dropping database if exists...
set PGPASSWORD=%DB_PASSWORD%
psql -U %DB_USER% -p %DB_PORT% -c "DROP DATABASE IF EXISTS %DB_NAME%;"

echo.
echo Creating new database...
psql -U %DB_USER% -p %DB_PORT% -c "CREATE DATABASE %DB_NAME%;"

echo.
echo ========================================
echo Database reset completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run start-all.bat to start all services
echo 2. The DataSeeder will automatically create the new schema with all Coupon fields
echo 3. Go to http://localhost:8080/admin to see the new coupon creation form
echo.
pause
