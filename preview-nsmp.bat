@echo off
cd /d "%~dp0"
echo Building and previewing NSMP frontend...
echo.
echo Keep this window open while using the app.
echo Open http://127.0.0.1:4173 in your browser.
echo.
npm.cmd run build && npm.cmd run preview -- --host 127.0.0.1 --port 4173
pause
