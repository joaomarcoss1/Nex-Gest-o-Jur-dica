@echo off
title Gestao Juridica Nex - Rodar no Windows
cd /d "%~dp0"
echo.
echo ========================================
echo  Gestao Juridica Nex - NexLabs
echo ========================================
echo.
echo Instalando dependencias...
call npm install --legacy-peer-deps
if errorlevel 1 (
  echo.
  echo Erro ao instalar dependencias.
  pause
  exit /b 1
)
echo.
echo Iniciando sistema...
echo O navegador abrira automaticamente. Se nao abrir, copie o link exibido no terminal.
echo.
call npm run dev
pause
