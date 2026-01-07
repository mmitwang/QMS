import XLSX from 'xlsx';
import { Parser } from 'json2csv';
import pool from '../config/database.js';

export class ReportService {
  // 导出质量检验报表
  async exportInspectionReport(format = 'excel', filters = {}) {
    try {
      let query = `
        SELECT 
          id as '序号',
          inspection_type as '检验类型',
          product_name as '产品名称',
          batch_number as '批次号',
          inspector as '检验员',
          inspection_date as '检验日期',
          inspection_result as '检验结果',
          defect_count as '缺陷数量',
          sample_size as '样本数量',
          remarks as '备注',
          created_at as '创建时间'
        FROM quality_inspections
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.startDate) {
        query += ' AND inspection_date >= ?';
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ' AND inspection_date <= ?';
        params.push(filters.endDate);
      }
      
      if (filters.inspectionType) {
        query += ' AND inspection_type = ?';
        params.push(filters.inspectionType);
      }
      
      if (filters.inspector) {
        query += ' AND inspector = ?';
        params.push(filters.inspector);
      }
      
      query += ' ORDER BY inspection_date DESC';
      
      const [rows] = await pool.execute(query, params);
      
      if (format === 'excel') {
        return this.generateExcel(rows, '质量检验报表');
      } else if (format === 'csv') {
        return this.generateCSV(rows);
      }
      
      return rows;
    } catch (error) {
      console.error('导出检验报表失败:', error);
      throw error;
    }
  }
  
  // 导出不合格品报表
  async exportNonconformingReport(format = 'excel', filters = {}) {
    try {
      let query = `
        SELECT 
          id as '序号',
          product_name as '产品名称',
          batch_number as '批次号',
          nonconforming_type as '不合格类型',
          description as '不合格描述',
          quantity as '数量',
          handler as '处理人',
          handling_method as '处理方式',
          status as '状态',
          created_at as '创建时间'
        FROM nonconforming_products
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.startDate) {
        query += ' AND DATE(created_at) >= ?';
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ' AND DATE(created_at) <= ?';
        params.push(filters.endDate);
      }
      
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await pool.execute(query, params);
      
      if (format === 'excel') {
        return this.generateExcel(rows, '不合格品报表');
      } else if (format === 'csv') {
        return this.generateCSV(rows);
      }
      
      return rows;
    } catch (error) {
      console.error('导出不合格品报表失败:', error);
      throw error;
    }
  }
  
  // 导出供应商质量报表
  async exportSupplierQualityReport(format = 'excel', filters = {}) {
    try {
      let query = `
        SELECT 
          id as '序号',
          supplier_name as '供应商名称',
          supplier_code as '供应商编码',
          evaluation_date as '评估日期',
          quality_score as '质量得分',
          delivery_score as '交付得分',
          service_score as '服务得分',
          total_score as '总分',
          grade as '等级',
          evaluator as '评估人',
          remarks as '备注',
          created_at as '创建时间'
        FROM supplier_quality
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.startDate) {
        query += ' AND evaluation_date >= ?';
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ' AND evaluation_date <= ?';
        params.push(filters.endDate);
      }
      
      if (filters.supplierName) {
        query += ' AND supplier_name LIKE ?';
        params.push(`%${filters.supplierName}%`);
      }
      
      query += ' ORDER BY evaluation_date DESC';
      
      const [rows] = await pool.execute(query, params);
      
      if (format === 'excel') {
        return this.generateExcel(rows, '供应商质量报表');
      } else if (format === 'csv') {
        return this.generateCSV(rows);
      }
      
      return rows;
    } catch (error) {
      console.error('导出供应商质量报表失败:', error);
      throw error;
    }
  }
  
  // 生成Excel文件
  generateExcel(data, sheetName) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    const colWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        colWidths.push({ wch: Math.min(maxLength + 2, 50) });
      });
    }
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
  
  // 生成CSV文件
  generateCSV(data) {
    if (data.length === 0) {
      return '';
    }
    
    const parser = new Parser({
      fields: Object.keys(data[0]),
      delimiter: ',',
      quote: '"',
      escape: '"'
    });
    
    return parser.parse(data);
  }
  
  // 导入质量检验数据
  async importInspectionData(fileBuffer, fileType) {
    try {
      let data = [];
      
      if (fileType === 'excel') {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (fileType === 'csv') {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
      
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };
      
      for (const row of data) {
        try {
          await pool.execute(`
            INSERT INTO quality_inspections 
            (inspection_type, product_name, batch_number, inspector, inspection_date, 
             inspection_result, defect_count, sample_size, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            row['检验类型'] || row.inspection_type,
            row['产品名称'] || row.product_name,
            row['批次号'] || row.batch_number,
            row['检验员'] || row.inspector,
            row['检验日期'] || row.inspection_date,
            row['检验结果'] || row.inspection_result,
            row['缺陷数量'] || row.defect_count || 0,
            row['样本数量'] || row.sample_size || 0,
            row['备注'] || row.remarks || ''
          ]);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: row,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('导入检验数据失败:', error);
      throw error;
    }
  }
  
  // 导入不合格品数据
  async importNonconformingData(fileBuffer, fileType) {
    try {
      let data = [];
      
      if (fileType === 'excel') {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (fileType === 'csv') {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
      
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };
      
      for (const row of data) {
        try {
          await pool.execute(`
            INSERT INTO nonconforming_products 
            (product_name, batch_number, nonconforming_type, description, 
             quantity, handler, handling_method, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            row['产品名称'] || row.product_name,
            row['批次号'] || row.batch_number,
            row['不合格类型'] || row.nonconforming_type,
            row['不合格描述'] || row.description || '',
            row['数量'] || row.quantity,
            row['处理人'] || row.handler,
            row['处理方式'] || row.handling_method || '',
            row['状态'] || row.status || 'pending'
          ]);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: row,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('导入不合格品数据失败:', error);
      throw error;
    }
  }
  
  // 获取报表统计数据
  async getReportStatistics(startDate, endDate) {
    try {
      const [inspectionStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_inspections,
          SUM(CASE WHEN inspection_result = '合格' THEN 1 ELSE 0 END) as passed_inspections,
          SUM(CASE WHEN inspection_result = '不合格' THEN 1 ELSE 0 END) as failed_inspections,
          SUM(defect_count) as total_defects
        FROM quality_inspections
        WHERE inspection_date BETWEEN ? AND ?
      `, [startDate, endDate]);
      
      const [nonconformingStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_nonconforming,
          SUM(quantity) as total_quantity,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
        FROM nonconforming_products
        WHERE DATE(created_at) BETWEEN ? AND ?
      `, [startDate, endDate]);
      
      const [supplierStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_evaluations,
          AVG(total_score) as avg_score,
          COUNT(CASE WHEN grade = 'A' THEN 1 END) as grade_a_count,
          COUNT(CASE WHEN grade = 'B' THEN 1 END) as grade_b_count,
          COUNT(CASE WHEN grade = 'C' THEN 1 END) as grade_c_count
        FROM supplier_quality
        WHERE evaluation_date BETWEEN ? AND ?
      `, [startDate, endDate]);
      
      return {
        inspection: inspectionStats[0],
        nonconforming: nonconformingStats[0],
        supplier: supplierStats[0]
      };
    } catch (error) {
      console.error('获取报表统计失败:', error);
      throw error;
    }
  }
}

export default new ReportService();
