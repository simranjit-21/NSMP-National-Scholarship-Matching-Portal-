@echo off
cd /d "%~dp0"
echo Starting NSMP frontend...
echo.
echo Keep this window open while using the app.
echo Open http://127.0.0.1:5173 in your browser.
echo.
npm.cmd run dev -- --host 127.0.0.1 --port 5173
pause
