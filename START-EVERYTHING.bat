@echo off
echo ========================================
echo  AI Agent Hub - Inicio Completo
echo ========================================
echo.
echo Este script iniciara:
echo  1. Los 3 AI Agents (Weather, Fashion, Activities)
echo  2. El servidor web del frontend
echo.
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado!
    echo Por favor instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado!
    echo Por favor instala Python desde: https://python.org
    pause
    exit /b 1
)

echo [1/5] Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias del proyecto...
    call npm install
)

echo.
echo [2/5] Iniciando Weather Agent en puerto 3001...
start "Weather Agent" cmd /k "cd agents\weather-agent && node weather-agent.js"
timeout /t 2 /nobreak >nul

echo [3/5] Iniciando Fashion Agent en puerto 3002...
start "Fashion Agent" cmd /k "cd agents\fashion-agent && node fashion-agent.js"
timeout /t 2 /nobreak >nul

echo [4/5] Iniciando Activities Agent en puerto 3003...
start "Activities Agent" cmd /k "cd agents\activities-agent && node activities-agent.js"
timeout /t 2 /nobreak >nul

echo [5/5] Iniciando servidor web en puerto 8000...
start "Frontend Server" cmd /k "cd frontend && python -m http.server 8000"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  Todo esta listo!
echo ========================================
echo.
echo Servicios corriendo:
echo.
echo  Frontend:         http://localhost:8000/web3-integration.html
echo  Weather Agent:    http://localhost:3001
echo  Fashion Agent:    http://localhost:3002
echo  Activities Agent: http://localhost:3003
echo.
echo ========================================
echo.
echo Abre tu navegador en: http://localhost:8000/web3-integration.html
echo.
echo IMPORTANTE: NO cierres las ventanas que se abrieron!
echo Para detener todo, cierra todas las ventanas.
echo.
echo ========================================
echo.
pause

REM Open browser automatically
start http://localhost:8000/web3-integration.html
