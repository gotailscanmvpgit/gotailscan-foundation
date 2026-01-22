@echo off
cd /d "%~dp0"
echo ========================================================
echo   GOTAILSCAN DEPLOYMENT SEQUENCE (EDGE FUNCTIONS)
echo ========================================================
echo.
echo Deploying edge function: resolveMakeModel
echo.
supabase functions deploy resolveMakeModel
echo.
echo ========================================================
pause
