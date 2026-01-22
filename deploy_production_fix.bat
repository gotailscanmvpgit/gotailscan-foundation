@echo off
cd /d "%~dp0"
echo ========================================================
echo   GOTAILSCAN DEPLOYMENT SEQUENCE
echo ========================================================
echo.
echo Switching to project directory...
echo Current Directory: %CD%
echo.
echo ========================================================
echo   STATUS CHECK
echo ========================================================
git status
echo.
echo ========================================================
echo   DEPLOYING MIGRATIONS & CODE
echo ========================================================
echo.
echo Pushing changes to GitHub (Production)...
echo.
echo NOTE: A separate window or prompt may ask for credentials.
echo       - Username: Your GitHub Username
echo       - Password: Your Personal Access Token (or password if allowed)
echo.
git push --set-upstream origin main
echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo   DEPLOYMENT SUCCESSFUL! 🚀
    echo   Please check production site.
) else (
    echo   DEPLOYMENT FAILED. Please checks errors above.
)
echo ========================================================
echo.
pause
