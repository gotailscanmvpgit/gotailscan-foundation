@echo off
echo ========================================
echo Database Migration - Automated Execution
echo ========================================
echo.

REM Read environment variables from .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="VITE_SUPABASE_URL" set SUPABASE_URL=%%b
    if "%%a"=="SUPABASE_SERVICE_ROLE_KEY" set SERVICE_KEY=%%b
)

echo Supabase URL: %SUPABASE_URL%
echo Service Key: Found
echo.

REM Extract project ref from URL
for /f "tokens=3 delims=/." %%a in ("%SUPABASE_URL%") do set PROJECT_REF=%%a

echo Project Ref: %PROJECT_REF%
echo.

echo ========================================
echo SQL Migration Content:
echo ========================================
type supabase\migrations\20260126023000_smart_reliability_view.sql
echo.
echo ========================================
echo.

echo [INFO] Supabase REST API does not support DDL operations.
echo [INFO] Please apply the migration manually via SQL Editor.
echo.
echo Quick Steps:
echo 1. Open: https://supabase.com/dashboard/project/%PROJECT_REF%/sql/new
echo 2. Copy the SQL shown above
echo 3. Click RUN
echo.
echo Press any key to open the SQL Editor in your browser...
pause >nul

start https://supabase.com/dashboard/project/%PROJECT_REF%/sql/new

echo.
echo [SUCCESS] SQL Editor opened in browser!
echo [ACTION] Please paste and run the SQL migration.
echo.
pause
