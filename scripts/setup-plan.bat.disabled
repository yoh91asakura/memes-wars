@echo off
REM Windows wrapper for setup-plan.sh
REM Usage: setup-plan.bat [--json]
REM Examples:
REM   setup-plan.bat
REM   setup-plan.bat --json

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
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/setup-plan.sh"
) else (
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/setup-plan.sh !ARGS!"
)

REM Capture and propagate the exit code
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% neq 0 (
    echo Error: Script failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)

exit /b 0