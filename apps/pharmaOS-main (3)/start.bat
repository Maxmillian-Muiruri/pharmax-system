@echo off
echo ========================================
echo   PharmaOS - Quick Start Script
echo ========================================
echo.

:: Check if PostgreSQL is running
echo [1/5] Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL is not running or not installed.
    echo Please start PostgreSQL or use Docker:
    echo.
    echo docker run --name pharmaos-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pharmaos -p 5432:5432 -d postgres:15
    echo.
    pause
    goto END
)
echo PostgreSQL is running!
echo.

:: Backend setup
echo [2/5] Setting up backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)

echo Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ERROR: Migration failed. Check database connection.
    pause
    goto END
)

echo Generating Prisma client...
call npx prisma generate

echo Seeding database...
call npm run seed

echo.
:: Start backend
echo [3/5] Starting backend server...
start "PharmaOS Backend" cmd /k "npm run dev"
echo Backend starting on http://localhost:3000
echo.

:: Frontend setup
echo [4/5] Setting up frontend...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

echo.
:: Start frontend
echo [5/5] Starting frontend application...
start "PharmaOS Frontend" cmd /k "npm run dev"
echo Frontend starting on http://localhost:5173
echo.

echo ========================================
echo   PharmaOS is starting!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul

:END
