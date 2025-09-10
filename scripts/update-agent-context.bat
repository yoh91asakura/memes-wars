@echo off
REM Windows wrapper for update-agent-context.sh
REM Usage: update-agent-context.bat [claude|gemini|copilot|all] [--json]
REM Examples:
REM   update-agent-context.bat
REM   update-agent-context.bat claude
REM   update-agent-context.bat all --json

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
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/update-agent-context.sh"
) else (
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/update-agent-context.sh !ARGS!"
)

REM Capture and propagate the exit code
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% neq 0 (
    echo Error: Script failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)

exit /b 0