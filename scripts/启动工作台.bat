@echo off
chcp 65001 >nul
title 团支书工作台
cd /d "C:\Users\15090\Desktop\团支书工作台"

rem ===== 清理残留 WebView2 进程（防止窗口类冲突导致闪退）=====
taskkill /F /IM msedgewebview2.exe >nul 2>&1

rem ===== 启动工作台（pythonw 静默运行，错误写入日志便于排查）=====
start "" /B "C:\Users\15090\AppData\Local\hermes\hermes-agent\venv\Scripts\pythonw.exe" "scripts/启动工作台.py" 2>"启动错误.log"

exit
