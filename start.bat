@echo off
echo Starting Personal Finance Tracker...
echo.
echo Starting Backend...
start cmd /k "cd backend && npm run dev"
echo.
echo Starting Frontend...
start cmd /k "cd frontend && npm start"
echo.
echo Both services are starting. Please wait a moment...
echo Frontend will be available at http://localhost:3000
echo Backend API will be available at http://localhost:5000
echo. 