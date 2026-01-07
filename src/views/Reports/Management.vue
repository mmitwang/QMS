<template>
  <div class="reports-management">
    <div class="page-header">
      <h1>报表管理</h1>
      <p>数据导入导出，报表生成与统计分析</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon inspection">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <h3>{{ statistics.inspection?.total_inspections || 0 }}</h3>
                <p>质量检验记录</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon nonconforming">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stats-info">
                <h3>{{ statistics.nonconforming?.total_nonconforming || 0 }}</h3>
                <p>不合格品记录</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon supplier">
                <el-icon><User /></el-icon>
              </div>
              <div class="stats-info">
                <h3>{{ statistics.supplier?.total_evaluations || 0 }}</h3>
                <p>供应商评估</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon success">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stats-info">
                <h3>{{ passRate }}%</h3>
                <p>合格率</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作区域 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>报表操作</span>
          <div class="date-range">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
            <el-button type="primary" @click="refreshStatistics">
              <el-icon><Refresh /></el-icon>
              刷新统计
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="report-tabs">
        <!-- 导出报表 -->
        <el-tab-pane label="导出报表" name="export">
          <div class="export-section">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="export-card">
                  <template #header>
                    <div class="export-header">
                      <el-icon><Document /></el-icon>
                      <span>质量检验报表</span>
                    </div>
                  </template>
                  <div class="export-content">
                    <p>导出质量检验记录数据</p>
                    <div class="export-filters">
                      <el-select v-model="exportFilters.inspection.inspectionType" placeholder="检验类型" clearable>
                        <el-option label="来料检验" value="来料检验" />
                        <el-option label="过程检验" value="过程检验" />
                        <el-option label="最终检验" value="最终检验" />
                        <el-option label="出货检验" value="出货检验" />
                      </el-select>
                      <el-input v-model="exportFilters.inspection.inspector" placeholder="检验员" clearable />
                    </div>
                    <div class="export-buttons">
                      <el-button type="primary" @click="exportReport('inspection', 'excel')" :loading="exportLoading.inspection">
                        <el-icon><Download /></el-icon>
                        导出Excel
                      </el-button>
                      <el-button @click="exportReport('inspection', 'csv')" :loading="exportLoading.inspection">
                        <el-icon><Download /></el-icon>
                        导出CSV
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="8">
                <el-card class="export-card">
                  <template #header>
                    <div class="export-header">
                      <el-icon><Warning /></el-icon>
                      <span>不合格品报表</span>
                    </div>
                  </template>
                  <div class="export-content">
                    <p>导出不合格品管理数据</p>
                    <div class="export-filters">
                      <el-select v-model="exportFilters.nonconforming.status" placeholder="处理状态" clearable>
                        <el-option label="待处理" value="pending" />
                        <el-option label="处理中" value="processing" />
                        <el-option label="已解决" value="resolved" />
                      </el-select>
                    </div>
                    <div class="export-buttons">
                      <el-button type="primary" @click="exportReport('nonconforming', 'excel')" :loading="exportLoading.nonconforming">
                        <el-icon><Download /></el-icon>
                        导出Excel
                      </el-button>
                      <el-button @click="exportReport('nonconforming', 'csv')" :loading="exportLoading.nonconforming">
                        <el-icon><Download /></el-icon>
                        导出CSV
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="8">
                <el-card class="export-card">
                  <template #header>
                    <div class="export-header">
                      <el-icon><User /></el-icon>
                      <span>供应商质量报表</span>
                    </div>
                  </template>
                  <div class="export-content">
                    <p>导出供应商质量评估数据</p>
                    <div class="export-filters">
                      <el-input v-model="exportFilters.supplier.supplierName" placeholder="供应商名称" clearable />
                    </div>
                    <div class="export-buttons">
                      <el-button type="primary" @click="exportReport('supplier', 'excel')" :loading="exportLoading.supplier">
                        <el-icon><Download /></el-icon>
                        导出Excel
                      </el-button>
                      <el-button @click="exportReport('supplier', 'csv')" :loading="exportLoading.supplier">
                        <el-icon><Download /></el-icon>
                        导出CSV
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 导入数据 -->
        <el-tab-pane label="导入数据" name="import">
          <div class="import-section">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="import-card">
                  <template #header>
                    <div class="import-header">
                      <el-icon><Upload /></el-icon>
                      <span>质量检验数据导入</span>
                    </div>
                  </template>
                  <div class="import-content">
                    <el-upload
                      ref="inspectionUpload"
                      class="upload-demo"
                      drag
                      :action="uploadUrl + '/inspection'"
                      :headers="uploadHeaders"
                      :on-success="handleImportSuccess"
                      :on-error="handleImportError"
                      :before-upload="beforeUpload"
                      :show-file-list="false"
                      accept=".xlsx,.xls,.csv"
                    >
                      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                      <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                      </div>
                      <template #tip>
                        <div class="el-upload__tip">
                          支持 Excel (.xlsx, .xls) 和 CSV 文件，文件大小不超过 10MB
                        </div>
                      </template>
                    </el-upload>
                    <div class="template-download">
                      <el-button type="text" @click="downloadTemplate('inspection')">
                        <el-icon><Download /></el-icon>
                        下载导入模板
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card class="import-card">
                  <template #header>
                    <div class="import-header">
                      <el-icon><Upload /></el-icon>
                      <span>不合格品数据导入</span>
                    </div>
                  </template>
                  <div class="import-content">
                    <el-upload
                      ref="nonconformingUpload"
                      class="upload-demo"
                      drag
                      :action="uploadUrl + '/nonconforming'"
                      :headers="uploadHeaders"
                      :on-success="handleImportSuccess"
                      :on-error="handleImportError"
                      :before-upload="beforeUpload"
                      :show-file-list="false"
                      accept=".xlsx,.xls,.csv"
                    >
                      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                      <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                      </div>
                      <template #tip>
                        <div class="el-upload__tip">
                          支持 Excel (.xlsx, .xls) 和 CSV 文件，文件大小不超过 10MB
                        </div>
                      </template>
                    </el-upload>
                    <div class="template-download">
                      <el-button type="text" @click="downloadTemplate('nonconforming')">
                        <el-icon><Download /></el-icon>
                        下载导入模板
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="importResultVisible" title="导入结果" width="600px">
      <div class="import-result">
        <div class="result-summary">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="result-item success">
                <h3>{{ importResult.success || 0 }}</h3>
                <p>成功导入</p>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="result-item failed">
                <h3>{{ importResult.failed || 0 }}</h3>
                <p>导入失败</p>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="result-item total">
                <h3>{{ (importResult.success || 0) + (importResult.failed || 0) }}</h3>
                <p>总计记录</p>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div v-if="importResult.errors && importResult.errors.length > 0" class="error-details">
          <h4>错误详情：</h4>
          <el-table :data="importResult.errors" max-height="300">
            <el-table-column prop="error" label="错误信息" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="importResultVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Warning,
  User,
  CircleCheck,
  Refresh,
  Download,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue'

export default {
  name: 'ReportsManagement',
  components: {
    Document,
    Warning,
    User,
    CircleCheck,
    Refresh,
    Download,
    Upload,
    UploadFilled
  },
  setup() {
    const activeTab = ref('export')
    const dateRange = ref([])
    const statistics = ref({})
    const importResultVisible = ref(false)
    const importResult = ref({})
    
    const exportLoading = reactive({
      inspection: false,
      nonconforming: false,
      supplier: false
    })
    
    const exportFilters = reactive({
      inspection: {
        inspectionType: '',
        inspector: ''
      },
      nonconforming: {
        status: ''
      },
      supplier: {
        supplierName: ''
      }
    })
    
    const apiBaseUrl = 'http://localhost:3001/api/reports'
    const uploadUrl = apiBaseUrl + '/import'
    const uploadHeaders = {
      'Content-Type': 'multipart/form-data'
    }
    
    // 计算合格率
    const passRate = computed(() => {
      const total = statistics.value.inspection?.total_inspections || 0
      const passed = statistics.value.inspection?.passed_inspections || 0
      return total > 0 ? Math.round((passed / total) * 100) : 0
    })
    
    // 获取统计数据
    const getStatistics = async () => {
      try {
        const startDate = dateRange.value?.[0] || '2024-01-01'
        const endDate = dateRange.value?.[1] || new Date().toISOString().split('T')[0]
        
        const response = await fetch(`${apiBaseUrl}/statistics?startDate=${startDate}&endDate=${endDate}`)
        const result = await response.json()
        
        if (result.success) {
          statistics.value = result.data
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }
    
    // 刷新统计
    const refreshStatistics = () => {
      getStatistics()
      ElMessage.success('统计数据已刷新')
    }
    
    // 日期范围变化
    const handleDateChange = () => {
      getStatistics()
    }
    
    // 导出报表
    const exportReport = async (type, format) => {
      try {
        exportLoading[type] = true
        
        const params = new URLSearchParams()
        params.append('format', format)
        
        if (dateRange.value?.[0]) {
          params.append('startDate', dateRange.value[0])
        }
        if (dateRange.value?.[1]) {
          params.append('endDate', dateRange.value[1])
        }
        
        // 添加特定过滤条件
        const filters = exportFilters[type]
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            params.append(key, filters[key])
          }
        })
        
        const response = await fetch(`${apiBaseUrl}/export/${type}?${params.toString()}`)
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          ElMessage.success('报表导出成功')
        } else {
          throw new Error('导出失败')
        }
      } catch (error) {
        console.error('导出报表失败:', error)
        ElMessage.error('导出失败，请重试')
      } finally {
        exportLoading[type] = false
      }
    }
    
    // 下载模板
    const downloadTemplate = async (type) => {
      try {
        const response = await fetch(`${apiBaseUrl}/template/${type}`)
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${type}_template.xlsx`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          ElMessage.success('模板下载成功')
        } else {
          throw new Error('下载失败')
        }
      } catch (error) {
        console.error('下载模板失败:', error)
        ElMessage.error('下载失败，请重试')
      }
    }
    
    // 上传前检查
    const beforeUpload = (file) => {
      const isValidType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                          'application/vnd.ms-excel', 
                          'text/csv'].includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10
      
      if (!isValidType) {
        ElMessage.error('只能上传 Excel 或 CSV 文件!')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('文件大小不能超过 10MB!')
        return false
      }
      return true
    }
    
    // 导入成功
    const handleImportSuccess = (response) => {
      if (response.success) {
        importResult.value = response.data
        importResultVisible.value = true
        ElMessage.success('数据导入完成')
        getStatistics() // 刷新统计数据
      } else {
        ElMessage.error(response.message || '导入失败')
      }
    }
    
    // 导入失败
    const handleImportError = (error) => {
      console.error('导入失败:', error)
      ElMessage.error('导入失败，请检查文件格式')
    }
    
    onMounted(() => {
      // 设置默认日期范围（最近30天）
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      dateRange.value = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ]
      
      getStatistics()
    })
    
    return {
      activeTab,
      dateRange,
      statistics,
      exportLoading,
      exportFilters,
      importResultVisible,
      importResult,
      uploadUrl,
      uploadHeaders,
      passRate,
      refreshStatistics,
      handleDateChange,
      exportReport,
      downloadTemplate,
      beforeUpload,
      handleImportSuccess,
      handleImportError
    }
  }
}
</script>

<style scoped>
.reports-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  height: 100px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stats-icon.inspection {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.nonconforming {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.supplier {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stats-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.operation-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-tabs {
  margin-top: 20px;
}

.export-section {
  padding: 20px 0;
}

.export-card {
  height: 280px;
}

.export-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.export-content {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.export-content p {
  color: #909399;
  margin: 0 0 16px 0;
}

.export-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.export-buttons {
  display: flex;
  gap: 12px;
}

.import-section {
  padding: 20px 0;
}

.import-card {
  height: 320px;
}

.import-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.import-content {
  height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.upload-demo {
  margin-bottom: 16px;
}

.template-download {
  text-align: center;
}

.import-result {
  padding: 20px 0;
}

.result-summary {
  margin-bottom: 20px;
}

.result-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}

.result-item.success {
  background: #f0f9ff;
  border: 1px solid #e1f5fe;
}

.result-item.failed {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.result-item.total {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.result-item h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.result-item.success h3 {
  color: #059669;
}

.result-item.failed h3 {
  color: #dc2626;
}

.result-item.total h3 {
  color: #374151;
}

.result-item p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.error-details {
  margin-top: 20px;
}

.error-details h4 {
  margin: 0 0 12px 0;
  color: #374151;
}
</style>
