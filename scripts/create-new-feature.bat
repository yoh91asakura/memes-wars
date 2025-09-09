@echo off
REM Windows wrapper for create-new-feature.sh
REM Usage: create-new-feature.bat "feature description"

if "%~1"=="" (
    echo Usage: %0 "feature description"
    exit /b 1
)

REM Use Git Bash to run the shell script
"C:\Program Files\Git\bin\bash.exe" -c "cd \"%CD%\" && ./scripts/create-new-feature.sh \"%*\""