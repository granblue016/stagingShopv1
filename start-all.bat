@echo off
echo ========================================
echo Starting ShopCart Services (Concurrently)
echo ========================================
echo.
echo Prerequisites:
echo - PostgreSQL running on port 5432
- Node.js installed
- Maven installed
echo.
echo Installing concurrently if not present...
call npm install
echo.
echo Starting all services in single terminal with colored prefixes...
echo.
call npm run start
