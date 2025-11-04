#!/bin/bash

echo "========================================"
echo "  Servidor Web Local - AI Agent Hub"
echo "========================================"
echo ""
echo "Iniciando servidor en http://localhost:8000"
echo ""
echo "Abre en tu navegador:"
echo "http://localhost:8000/web3-integration.html"
echo ""
echo "Para ver el diagnóstico de wallet:"
echo "http://localhost:8000/test-wallet-detection.html"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "========================================"
echo ""

# Intentar Node.js primero
if command -v node &> /dev/null; then
    echo "Usando Node.js..."
    node server.js
# Si no, usar Python
elif command -v python3 &> /dev/null; then
    echo "Usando Python 3..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Usando Python..."
    python -m http.server 8000
else
    echo "Error: No se encontró Node.js ni Python"
    echo "Instala Node.js desde https://nodejs.org"
    exit 1
fi
