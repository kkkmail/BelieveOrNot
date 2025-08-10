@echo off
if "%~1"=="" (
    echo Usage: %~nx0 promptFileName.txt
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Run-Aider.ps1" "%~1"
