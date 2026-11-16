@echo off
title Push BVC Syntax Hub to GitHub
echo ===================================================
echo   Pushing BVC Syntax Hub to GitHub
echo   Repository: https://github.com/charan20-lang/bvc_syntax_hub.git
echo ===================================================
echo.
cd /d "%~dp0"

echo Running: git push -u origin main --force
git push -u origin main --force

echo.
echo ===================================================
echo   Push Complete!
echo ===================================================
pause
