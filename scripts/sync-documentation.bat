@echo off
REM Windows wrapper for sync-documentation.sh
REM Usage: sync-documentation.bat [--auto] [--all] [--json]
REM Examples:
REM   sync-documentation.bat
REM   sync-documentation.bat --auto
REM   sync-documentation.bat --all --json

setlocal enabledelayedexpansion

REM Build argument string for optional parameters
set "ARGS="
set "FIRST=true"
:loop
if "%~1"=="" goto :run
if "!FIRST!"=="true" (
    set "ARGS=%~1"
    set "FIRST=false"
) else (
    set "ARGS=!ARGS! %~1"
)
shift
goto :loop

:run
REM Use Git Bash to run the shell script with proper argument passing
if "!ARGS!"=="" (
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/sync-documentation.sh"
) else (
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/sync-documentation.sh !ARGS!"
)

REM Capture and propagate the exit code
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% neq 0 (
    echo Error: Documentation sync failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)

exit /b 0