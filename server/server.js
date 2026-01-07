import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import reportsRouter from './routes/reports.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:3003', 'http://127.0.0.1:3003'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api/reports', reportsRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'QMS Backend Server'
  });
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'QMS质量管理系统后端服务',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      reports: '/api/reports',
      export: {
        inspection: '/api/reports/export/inspection',
        nonconforming: '/api/reports/export/nonconforming',
        supplier: '/api/reports/export/supplier'
      },
      import: {
        inspection: '/api/reports/import/inspection',
        nonconforming: '/api/reports/import/nonconforming'
      },
      templates: {
        inspection: '/api/reports/template/inspection',
        nonconforming: '/api/reports/template/nonconforming'
      },
      statistics: '/api/reports/statistics'
    }
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: '文件大小超过限制（最大10MB）'
    });
  }
  
  if (error.message === '不支持的文件类型') {
    return res.status(400).json({
      success: false,
      message: '不支持的文件类型，请上传Excel或CSV文件'
    });
  }
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    console.log('正在初始化数据库...');
    await initDatabase();
    console.log('数据库初始化完成');
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    QMS质量管理系统后端服务                      ║
║                                                              ║
║  服务器地址: http://localhost:${PORT}                           ║
║  健康检查: http://localhost:${PORT}/health                      ║
║  API文档: http://localhost:${PORT}/                            ║
║                                                              ║
║  数据库: MySQL (${process.env.DB_HOST}:${process.env.DB_PORT})                              ║
║  数据库名: ${process.env.DB_NAME}                                    ║
║                                                              ║
║  主要功能:                                                    ║
║  • 报表导入导出                                               ║
║  • 数据库同步                                                 ║
║  • 文件上传处理                                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 启动应用
startServer();
