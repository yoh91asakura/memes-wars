@echo off
REM Windows wrapper for setup-plan.sh

REM Use Git Bash to run the shell script
"C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/setup-plan.sh"