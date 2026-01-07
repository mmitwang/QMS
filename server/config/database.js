import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// 初始化数据库表
export const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // 创建数据库（如果不存在）
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.execute(`USE ${process.env.DB_NAME}`);
    
    // 创建质量检验记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quality_inspections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inspection_type VARCHAR(50) NOT NULL COMMENT '检验类型',
        product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
        batch_number VARCHAR(50) NOT NULL COMMENT '批次号',
        inspector VARCHAR(50) NOT NULL COMMENT '检验员',
        inspection_date DATE NOT NULL COMMENT '检验日期',
        inspection_result VARCHAR(20) NOT NULL COMMENT '检验结果',
        defect_count INT DEFAULT 0 COMMENT '缺陷数量',
        sample_size INT DEFAULT 0 COMMENT '样本数量',
        remarks TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建不合格品管理表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS nonconforming_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
        batch_number VARCHAR(50) NOT NULL COMMENT '批次号',
        nonconforming_type VARCHAR(50) NOT NULL COMMENT '不合格类型',
        description TEXT COMMENT '不合格描述',
        quantity INT NOT NULL COMMENT '数量',
        handler VARCHAR(50) NOT NULL COMMENT '处理人',
        handling_method VARCHAR(100) COMMENT '处理方式',
        status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建供应商质量评估表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS supplier_quality (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(100) NOT NULL COMMENT '供应商名称',
        supplier_code VARCHAR(50) NOT NULL COMMENT '供应商编码',
        evaluation_date DATE NOT NULL COMMENT '评估日期',
        quality_score DECIMAL(5,2) NOT NULL COMMENT '质量得分',
        delivery_score DECIMAL(5,2) NOT NULL COMMENT '交付得分',
        service_score DECIMAL(5,2) NOT NULL COMMENT '服务得分',
        total_score DECIMAL(5,2) NOT NULL COMMENT '总分',
        grade VARCHAR(10) NOT NULL COMMENT '等级',
        evaluator VARCHAR(50) NOT NULL COMMENT '评估人',
        remarks TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建文档管理表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quality_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_type VARCHAR(50) NOT NULL COMMENT '文档类型',
        document_name VARCHAR(200) NOT NULL COMMENT '文档名称',
        document_code VARCHAR(50) NOT NULL COMMENT '文档编号',
        version VARCHAR(20) NOT NULL COMMENT '版本号',
        status VARCHAR(20) DEFAULT 'draft' COMMENT '状态',
        author VARCHAR(50) NOT NULL COMMENT '作者',
        approver VARCHAR(50) COMMENT '审批人',
        effective_date DATE COMMENT '生效日期',
        content TEXT COMMENT '文档内容',
        file_path VARCHAR(500) COMMENT '文件路径',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
        password VARCHAR(255) NOT NULL COMMENT '密码',
        real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
        email VARCHAR(100) COMMENT '邮箱',
        phone VARCHAR(20) COMMENT '电话',
        role VARCHAR(20) DEFAULT 'user' COMMENT '角色',
        department VARCHAR(50) COMMENT '部门',
        status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

export default pool;
