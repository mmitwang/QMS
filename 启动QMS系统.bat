@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    QMS质量管理系统启动器                      ║
echo ║                                                              ║
echo ║  正在启动前端和后端服务...                                    ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [1/3] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过

echo.
echo [2/3] 启动后端服务器...
start "QMS后端服务" cmd /k "cd /d %~dp0server && echo 正在启动QMS后端服务... && node server.js"

echo.
echo [3/3] 等待3秒后启动前端服务...
timeout /t 3 /nobreak >nul

start "QMS前端服务" cmd /k "cd /d %~dp0 && echo 正在启动QMS前端服务... && npm run dev"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      启动完成                                ║
echo ║                                                              ║
echo ║  前端地址: http://localhost:3003                             ║
echo ║  后端地址: http://localhost:3001                             ║
echo ║                                                              ║
echo ║  请等待服务完全启动后访问前端地址                             ║
echo ║                                                              ║
echo ║  注意: 请确保MySQL数据库已启动                               ║
echo ║  数据库配置: localhost:3306                                  ║
echo ║  数据库名: qms_database                                      ║
echo ║  用户名: root                                                ║
echo ║  密码: 123456                                                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 按任意键关闭此窗口...
pause >nul
