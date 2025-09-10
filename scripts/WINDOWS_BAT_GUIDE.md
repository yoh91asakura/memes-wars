# Windows .bat File Wrapper Guide

This guide explains the Windows .bat file patterns used to call bash scripts with proper parameter handling and error propagation.

## Overview

The .bat files in this directory serve as Windows wrappers for bash scripts, providing:
- Proper parameter passing with quoted strings and spaces
- Exit code propagation from bash to Windows
- Help and usage information
- Error handling and reporting

## File Structure

### 1. create-new-feature.bat
- **Purpose**: Wrapper for `scripts/create-new-feature.sh`
- **Usage**: `create-new-feature.bat [--json] "feature description"`
- **Examples**:
  ```cmd
  create-new-feature.bat "new card rarity system"
  create-new-feature.bat --json "advanced combat mechanics"
  ```

### 2. setup-plan.bat
- **Purpose**: Wrapper for `scripts/setup-plan.sh`
- **Usage**: `setup-plan.bat [--json]`
- **Examples**:
  ```cmd
  setup-plan.bat
  setup-plan.bat --json
  ```

## .bat File Pattern Explained

### Core Pattern Structure
```batch
@echo off
REM Windows wrapper for [script-name].sh
REM Usage: [script-name].bat [parameters]

setlocal enabledelayedexpansion

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
"C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/[script-name].sh !ARGS!"

REM Capture and propagate the exit code
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% neq 0 (
    echo Error: Script failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)

exit /b 0
```

### Key Components Explained

#### 1. Parameter Loop
```batch
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
```
- **Purpose**: Collect all command-line parameters into a single string
- **%~1**: Removes quotes from the parameter while preserving the content
- **FIRST flag**: Ensures proper spacing between parameters
- **shift**: Moves to the next parameter

#### 2. Git Bash Execution
```batch
"C:\Program Files\Git\bin\bash.exe" -c "cd '%CD%' && ./scripts/[script-name].sh !ARGS!"
```
- **Git Bash Path**: Uses the standard Git for Windows installation path
- **-c**: Executes the command string
- **cd '%CD%'**: Changes to the current Windows directory
- **!ARGS!**: Passes all collected arguments to the bash script

#### 3. Error Handling
```batch
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% neq 0 (
    echo Error: Script failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)
```
- **%ERRORLEVEL%**: Captures the exit code from the bash script
- **exit /b**: Exits the batch file with the same code
- **Error message**: Provides clear feedback when scripts fail

## Parameter Handling Features

### Quoted Parameters with Spaces
✅ **Works correctly**:
```cmd
create-new-feature.bat "advanced combat mechanics with special effects"
create-new-feature.bat --json "complex feature name with spaces"
```

### Multiple Parameters
✅ **Works correctly**:
```cmd
setup-plan.bat --json
create-new-feature.bat --json "feature description"
```

### Empty Parameters
✅ **Handled gracefully**:
```cmd
create-new-feature.bat
# Shows usage message and exits with code 1
```

## Error Code Propagation

The .bat files properly propagate exit codes:
- **Success (0)**: Script completed successfully
- **Error (1)**: Missing parameters or validation failure
- **Error (2+)**: Script-specific errors (git failures, file access, etc.)

## Testing Commands

### Test Parameter Handling
```cmd
# Test help functionality
scripts\create-new-feature.bat --help
scripts\setup-plan.bat --help

# Test JSON mode
scripts\setup-plan.bat --json

# Test error handling
scripts\create-new-feature.bat
# Should show usage and exit with code 1
```

### Test with Spaces
```cmd
# This should work correctly with quoted parameters
scripts\create-new-feature.bat "test feature with spaces"
```

## Troubleshooting

### Common Issues

#### 1. Git Bash Not Found
**Error**: `'C:\Program Files\Git\bin\bash.exe' is not recognized`
**Solution**: Install Git for Windows or update the path in the .bat files

#### 2. Script Permission Denied
**Error**: `Permission denied` when running bash scripts
**Solution**: Ensure bash scripts have execute permissions:
```bash
chmod +x scripts/*.sh
```

#### 3. Working Directory Issues
**Error**: Scripts can't find files or directories
**Solution**: Always run .bat files from the repository root directory

### Alternative Git Bash Paths
If Git is installed in a different location, update the path in both .bat files:
```batch
REM Common alternative paths:
"C:\Git\bin\bash.exe"
"C:\Program Files (x86)\Git\bin\bash.exe"
"%USERPROFILE%\scoop\apps\git\current\bin\bash.exe"
```

## Best Practices

### 1. Always Quote Parameters with Spaces
```cmd
# Good
create-new-feature.bat "my feature description"

# Bad - will be interpreted as multiple parameters
create-new-feature.bat my feature description
```

### 2. Run from Repository Root
```cmd
# Good - from memes-wars directory
scripts\create-new-feature.bat "feature name"

# Bad - from other directories
cd scripts
create-new-feature.bat "feature name"
```

### 3. Check Exit Codes in Scripts
```cmd
scripts\create-new-feature.bat "test feature"
if %ERRORLEVEL% neq 0 (
    echo Feature creation failed!
    exit /b 1
)
echo Feature created successfully!
```

## Advanced Usage

### Conditional JSON Output
```cmd
REM Use JSON output for programmatic consumption
scripts\setup-plan.bat --json > plan-info.json
if %ERRORLEVEL% equ 0 (
    echo Plan setup completed, info saved to plan-info.json
)
```

### Integration with Other Windows Tools
```cmd
REM Chain multiple commands
scripts\create-new-feature.bat "new feature" && scripts\setup-plan.bat --json
```

This pattern provides robust Windows integration while maintaining compatibility with the existing bash script ecosystem.