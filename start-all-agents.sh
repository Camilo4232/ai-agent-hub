#!/bin/bash

echo "========================================"
echo "  Iniciando todos los AI Agents"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado!"
    echo "Por favor instala Node.js desde: https://nodejs.org"
    exit 1
fi

echo "[1/4] Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del proyecto..."
    npm install
fi

echo ""
echo "[2/4] Iniciando Weather Agent en puerto 3001..."
cd agents/weather-agent
node weather-agent.js &
WEATHER_PID=$!
cd ../..
sleep 2

echo "[3/4] Iniciando Fashion Agent en puerto 3002..."
cd agents/fashion-agent
node fashion-agent.js &
FASHION_PID=$!
cd ../..
sleep 2

echo "[4/4] Iniciando Activities Agent en puerto 3003..."
cd agents/activities-agent
node activities-agent.js &
ACTIVITIES_PID=$!
cd ../..
sleep 2

echo ""
echo "========================================"
echo "  Todos los agentes iniciados!"
echo "========================================"
echo ""
echo "Weather Agent:    http://localhost:3001 (PID: $WEATHER_PID)"
echo "Fashion Agent:    http://localhost:3002 (PID: $FASHION_PID)"
echo "Activities Agent: http://localhost:3003 (PID: $ACTIVITIES_PID)"
echo ""
echo "Presiona Ctrl+C para detener todos los agentes"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Deteniendo agentes...'; kill $WEATHER_PID $FASHION_PID $ACTIVITIES_PID; exit" INT
wait
