@echo off
echo ========================================
echo Starting ShopCart Services (Concurrently)
echo ========================================
echo.
echo Prerequisites:
echo - PostgreSQL running on port 5432
echo - Node.js installed
echo - Maven installed
echo - Python installed (for NLP-Service)
echo.
echo Installing concurrently if not present...
call npm install
echo.
echo Starting all services in single terminal with colored prefixes...
echo.
call npm run start:all
