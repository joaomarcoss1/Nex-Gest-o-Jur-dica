@echo off
title Gestao Juridica Nex - Limpar e Rodar
cd /d "%~dp0"
echo.
echo ========================================
echo  Limpando instalacao antiga do projeto
echo ========================================
echo.
echo Encerrando processos node.exe abertos...
taskkill /F /IM node.exe /T >nul 2>nul
echo Removendo node_modules e package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo.
echo Instalando dependencias limpas...
call npm install --legacy-peer-deps
if errorlevel 1 (
  echo.
  echo Erro ao instalar dependencias.
  pause
  exit /b 1
)
echo.
echo Iniciando sistema...
call npm run dev
pause
