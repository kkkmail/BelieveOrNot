@echo off
if "%~1"=="" (
    echo Usage: %~nx0 promptFileName.txt
    exit /b 1
)

rem Always prefix with a marker so PowerShell never treats it as a switch
set "ARG=@@%~1"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Run-Aider.ps1" "%ARG%"
