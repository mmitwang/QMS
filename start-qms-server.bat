@echo off
echo ========================================
echo 启动 QMS质量管理系统
echo ========================================
echo.

cd /d "%~dp0"

echo 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo 检查依赖包...
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo 错误: 依赖包安装失败
        pause
        exit /b 1
    )
)

echo.
echo 启动 QMS质量管理系统开发服务器...
echo 系统将在 http://localhost:3004 运行
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================

npm run dev

pause
