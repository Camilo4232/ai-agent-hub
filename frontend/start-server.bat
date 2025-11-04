@echo off
echo ========================================
echo  Servidor Web Local - AI Agent Hub
echo ========================================
echo.
echo Iniciando servidor en http://localhost:8000
echo.
echo Abre en tu navegador:
echo http://localhost:8000/web3-integration.html
echo.
echo Para ver el diagnostico de wallet:
echo http://localhost:8000/test-wallet-detection.html
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

python -m http.server 8000
