import express from 'express';
import multer from 'multer';
import reportService from '../services/reportService.js';

const router = express.Router();

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 导出质量检验报表
router.get('/export/inspection', async (req, res) => {
  try {
    const { format = 'excel', ...filters } = req.query;
    
    if (format === 'json') {
      const data = await reportService.exportInspectionReport('json', filters);
      res.json({
        success: true,
        data: data
      });
    } else {
      const buffer = await reportService.exportInspectionReport(format, filters);
      const filename = `质量检验报表_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv; charset=utf-8');
      
      res.send(buffer);
    }
  } catch (error) {
    console.error('导出检验报表失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

// 导出不合格品报表
router.get('/export/nonconforming', async (req, res) => {
  try {
    const { format = 'excel', ...filters } = req.query;
    
    if (format === 'json') {
      const data = await reportService.exportNonconformingReport('json', filters);
      res.json({
        success: true,
        data: data
      });
    } else {
      const buffer = await reportService.exportNonconformingReport(format, filters);
      const filename = `不合格品报表_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv; charset=utf-8');
      
      res.send(buffer);
    }
  } catch (error) {
    console.error('导出不合格品报表失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

// 导出供应商质量报表
router.get('/export/supplier', async (req, res) => {
  try {
    const { format = 'excel', ...filters } = req.query;
    
    if (format === 'json') {
      const data = await reportService.exportSupplierQualityReport('json', filters);
      res.json({
        success: true,
        data: data
      });
    } else {
      const buffer = await reportService.exportSupplierQualityReport(format, filters);
      const filename = `供应商质量报表_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv; charset=utf-8');
      
      res.send(buffer);
    }
  } catch (error) {
    console.error('导出供应商报表失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

// 导入质量检验数据
router.post('/import/inspection', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要导入的文件'
      });
    }
    
    const fileType = req.file.mimetype.includes('sheet') ? 'excel' : 'csv';
    const result = await reportService.importInspectionData(req.file.buffer, fileType);
    
    res.json({
      success: true,
      message: '导入完成',
      data: result
    });
  } catch (error) {
    console.error('导入检验数据失败:', error);
    res.status(500).json({
      success: false,
      message: '导入失败',
      error: error.message
    });
  }
});

// 导入不合格品数据
router.post('/import/nonconforming', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要导入的文件'
      });
    }
    
    const fileType = req.file.mimetype.includes('sheet') ? 'excel' : 'csv';
    const result = await reportService.importNonconformingData(req.file.buffer, fileType);
    
    res.json({
      success: true,
      message: '导入完成',
      data: result
    });
  } catch (error) {
    console.error('导入不合格品数据失败:', error);
    res.status(500).json({
      success: false,
      message: '导入失败',
      error: error.message
    });
  }
});

// 获取报表统计数据
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '请提供开始日期和结束日期'
      });
    }
    
    const statistics = await reportService.getReportStatistics(startDate, endDate);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

// 获取导出模板
router.get('/template/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let templateData = [];
    let filename = '';
    
    switch (type) {
      case 'inspection':
        templateData = [{
          '检验类型': '来料检验',
          '产品名称': '示例产品',
          '批次号': 'BATCH001',
          '检验员': '张三',
          '检验日期': '2024-01-01',
          '检验结果': '合格',
          '缺陷数量': 0,
          '样本数量': 100,
          '备注': '无异常'
        }];
        filename = '质量检验导入模板.xlsx';
        break;
        
      case 'nonconforming':
        templateData = [{
          '产品名称': '示例产品',
          '批次号': 'BATCH001',
          '不合格类型': '外观缺陷',
          '不合格描述': '表面划痕',
          '数量': 5,
          '处理人': '李四',
          '处理方式': '返工',
          '状态': 'pending'
        }];
        filename = '不合格品导入模板.xlsx';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: '不支持的模板类型'
        });
    }
    
    const buffer = reportService.generateExcel(templateData, '导入模板');
    
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.send(buffer);
  } catch (error) {
    console.error('获取模板失败:', error);
    res.status(500).json({
      success: false,
      message: '获取模板失败',
      error: error.message
    });
  }
});

export default router;
