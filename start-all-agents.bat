@echo off
echo ========================================
echo  Iniciando todos los AI Agents
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado!
    echo Por favor instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias del proyecto...
    call npm install
)

echo.
echo [2/4] Iniciando Weather Agent en puerto 3001...
start "Weather Agent" cmd /k "cd agents\weather-agent && node weather-agent.js"
timeout /t 2 /nobreak >nul

echo [3/4] Iniciando Fashion Agent en puerto 3002...
start "Fashion Agent" cmd /k "cd agents\fashion-agent && node fashion-agent.js"
timeout /t 2 /nobreak >nul

echo [4/4] Iniciando Activities Agent en puerto 3003...
start "Activities Agent" cmd /k "cd agents\activities-agent && node activities-agent.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  Todos los agentes iniciados!
echo ========================================
echo.
echo Weather Agent:    http://localhost:3001
echo Fashion Agent:    http://localhost:3002
echo Activities Agent: http://localhost:3003
echo.
echo Las ventanas se abrieron en pestanas separadas.
echo IMPORTANTE: NO cierres esas ventanas!
echo.
echo Para detener todos los agentes, cierra todas las ventanas.
echo.
pause
