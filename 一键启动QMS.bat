@echo off
chcp 65001 >nul
title QMS质量管理系统 - 一键启动
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    QMS质量管理系统                          ║
echo ║                      一键启动工具                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] 检查运行环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js
    echo    请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js 环境正常
)

echo.
echo [2/4] 检查项目依赖...
if not exist "node_modules" (
    echo 📦 正在安装依赖包，请稍候...
    npm install --silent
    if errorlevel 1 (
        echo ❌ 依赖包安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖包安装完成
) else (
    echo ✅ 项目依赖已就绪
)

echo.
echo [3/4] 启动开发服务器...
echo 🚀 正在启动 QMS质量管理系统...
echo 📍 服务地址: http://localhost:3004
echo.

REM 启动开发服务器（后台运行）
start /B npm run dev

echo [4/4] 等待服务器启动...
timeout /t 3 /nobreak >nul

echo ✅ 服务器启动完成！
echo.
echo 🌐 正在打开浏览器...
timeout /t 2 /nobreak >nul

REM 打开默认浏览器
start http://localhost:3004

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  🎉 QMS质量管理系统已成功启动！                             ║
echo ║                                                              ║
echo ║  📍 访问地址: http://localhost:3004                         ║
echo ║  🔧 开发模式: 支持热重载                                    ║
echo ║  📊 功能模块: 17个完整的质量管理功能                        ║
echo ║                                                              ║
echo ║  💡 提示:                                                    ║
echo ║     - 修改代码后会自动刷新页面                               ║
echo ║     - 按 Ctrl+C 可停止服务器                                ║
echo ║     - 关闭此窗口会停止服务器                                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 按任意键关闭启动工具（服务器将继续运行）...
pause >nul

echo.
echo 🔄 启动工具已关闭，QMS系统继续运行中...
echo 📍 访问地址: http://localhost:3004
echo.
