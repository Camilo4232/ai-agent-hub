@echo off
echo.
echo ===============================================
echo  Starting All AI Agents
echo ===============================================
echo.

cd /d "%~dp0"

echo Starting Weather Agent on port 3001...
start "Weather Agent" cmd /k "node weather-agent/weather-agent.js"
timeout /t 2 /nobreak > nul

echo Starting Fashion Agent on port 3002...
start "Fashion Agent" cmd /k "node fashion-agent/fashion-agent.js"
timeout /t 2 /nobreak > nul

echo Starting Activities Agent on port 3003...
start "Activities Agent" cmd /k "node activities-agent/activities-agent.js"
timeout /t 2 /nobreak > nul

echo.
echo ===============================================
echo  All agents started!
echo ===============================================
echo.
echo  Weather Agent:    http://localhost:3001
echo  Fashion Agent:    http://localhost:3002
echo  Activities Agent: http://localhost:3003
echo.
echo  Press any key to run the demo...
pause > nul

echo.
echo Running A2A Communication Demo...
node demo-a2a.js

echo.
echo Demo completed. Press any key to exit...
pause > nul
