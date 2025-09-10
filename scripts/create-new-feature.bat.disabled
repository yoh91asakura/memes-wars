@echo off
REM Windows wrapper for create-new-feature.sh
REM Usage: create-new-feature.bat [--json] "feature description"
REM Examples:
REM   create-new-feature.bat "new card rarity system"
REM   create-new-feature.bat --json "advanced combat mechanics"

setlocal enabledelayedexpansion

REM Check if any parameters provided
if "%~1"=="" (
    echo Usage: %0 [--json] "feature description"
    echo Examples:
    echo   %0 "new card rarity system"
    echo   %0 --json "advanced combat mechanics"
    exit /b 1
)

REM Build argument string preserving quotes and spaces
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
"C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/create-new-feature.sh !ARGS!"

REM Capture and propagate the exit code
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% neq 0 (
    echo Error: Script failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)

exit /b 0