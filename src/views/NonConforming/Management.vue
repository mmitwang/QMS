<template>
  <div class="nonconforming-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>不合格品管理</h2>
      <p>管理和跟踪不合格品的识别、隔离、处置和预防措施</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon processing">
              <el-icon><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.processing }}</div>
              <div class="stat-label">处理中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon completed">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rate">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.rate }}%</div>
              <div class="stat-label">不合格率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索不合格品编号、产品名称"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.severity" placeholder="严重程度" clearable>
            <el-option label="严重" value="critical" />
            <el-option label="重要" value="major" />
            <el-option label="一般" value="minor" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
      <el-row style="margin-top: 16px;">
        <el-col :span="24">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增不合格品
          </el-button>
          <el-button @click="handleBatchProcess" :disabled="!selectedItems.length">
            <el-icon><Tools /></el-icon>
            批量处理
          </el-button>
          <el-button @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 不合格品列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>不合格品列表</span>
          <div class="view-toggle">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="table">表格视图</el-radio-button>
              <el-radio-button label="card">卡片视图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 表格视图 -->
      <el-table
        v-if="viewMode === 'table'"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="ncNumber" label="不合格品编号" width="140" />
        <el-table-column prop="productName" label="产品名称" width="150" />
        <el-table-column prop="batchNumber" label="批次号" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" align="right" />
        <el-table-column prop="defectType" label="缺陷类型" width="120" />
        <el-table-column prop="severity" label="严重程度" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getSeverityType(scope.row.severity)">
              {{ getSeverityText(scope.row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="discoveredBy" label="发现人" width="100" />
        <el-table-column prop="discoveredDate" label="发现日期" width="120" />
        <el-table-column prop="assignee" label="负责人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" type="primary" @click="editItem(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-dropdown @command="(command) => handleAction(command, scope.row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="process">处理</el-dropdown-item>
                  <el-dropdown-item command="close">关闭</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <el-row :gutter="20">
          <el-col :span="8" v-for="item in tableData" :key="item.id">
            <el-card class="nc-card" :class="getSeverityClass(item.severity)">
              <template #header>
                <div class="nc-card-header">
                  <span class="nc-number">{{ item.ncNumber }}</span>
                  <el-tag :type="getStatusType(item.status)" size="small">
                    {{ getStatusText(item.status) }}
                  </el-tag>
                </div>
              </template>
              <div class="nc-card-content">
                <div class="nc-info">
                  <div class="info-item">
                    <span class="label">产品名称：</span>
                    <span class="value">{{ item.productName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">批次号：</span>
                    <span class="value">{{ item.batchNumber }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">缺陷类型：</span>
                    <span class="value">{{ item.defectType }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">数量：</span>
                    <span class="value">{{ item.quantity }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">严重程度：</span>
                    <el-tag :type="getSeverityType(item.severity)" size="small">
                      {{ getSeverityText(item.severity) }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="label">发现人：</span>
                    <span class="value">{{ item.discoveredBy }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">发现日期：</span>
                    <span class="value">{{ item.discoveredDate }}</span>
                  </div>
                </div>
                <div class="nc-actions">
                  <el-button size="small" @click="viewDetail(item)">查看</el-button>
                  <el-button size="small" type="primary" @click="editItem(item)">编辑</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingItem ? '编辑不合格品' : '新增不合格品'"
      width="800px"
      @close="resetForm"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="不合格品编号" prop="ncNumber">
              <el-input v-model="formData.ncNumber" :disabled="editingItem" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="formData.productName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNumber">
              <el-input v-model="formData.batchNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="formData.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="缺陷类型" prop="defectType">
              <el-select v-model="formData.defectType" placeholder="选择缺陷类型" style="width: 100%">
                <el-option label="尺寸偏差" value="dimension" />
                <el-option label="外观缺陷" value="appearance" />
                <el-option label="功能异常" value="function" />
                <el-option label="材料问题" value="material" />
                <el-option label="包装问题" value="packaging" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="严重程度" prop="severity">
              <el-select v-model="formData.severity" placeholder="选择严重程度" style="width: 100%">
                <el-option label="严重" value="critical" />
                <el-option label="重要" value="major" />
                <el-option label="一般" value="minor" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发现人" prop="discoveredBy">
              <el-input v-model="formData.discoveredBy" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发现日期" prop="discoveredDate">
              <el-date-picker
                v-model="formData.discoveredDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="详细描述不合格品的问题"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-select v-model="formData.assignee" placeholder="选择负责人" style="width: 100%">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
            <el-option label="赵六" value="赵六" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="不合格品详情" width="1000px">
      <div class="detail-content" v-if="currentItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="不合格品编号">{{ currentItem.ncNumber }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentItem.productName }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentItem.batchNumber }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ currentItem.quantity }}</el-descriptions-item>
          <el-descriptions-item label="缺陷类型">{{ currentItem.defectType }}</el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityType(currentItem.severity)">
              {{ getSeverityText(currentItem.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentItem.status)">
              {{ getStatusText(currentItem.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发现人">{{ currentItem.discoveredBy }}</el-descriptions-item>
          <el-descriptions-item label="发现日期">{{ currentItem.discoveredDate }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentItem.assignee }}</el-descriptions-item>
          <el-descriptions-item label="问题描述" :span="2">{{ currentItem.description }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 处理记录 -->
        <div class="process-records" style="margin-top: 20px;">
          <h4>处理记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="record in currentItem.processRecords"
              :key="record.id"
              :timestamp="record.timestamp"
              :type="record.type"
            >
              <div class="record-content">
                <div class="record-title">{{ record.title }}</div>
                <div class="record-desc">{{ record.description }}</div>
                <div class="record-operator">操作人：{{ record.operator }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Download,
  Edit,
  View,
  Delete,
  ArrowDown,
  Warning,
  Tools,
  CircleCheck,
  TrendCharts
} from '@element-plus/icons-vue'

// 响应式数据
const viewMode = ref('table')
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const editingItem = ref(null)
const currentItem = ref(null)
const selectedItems = ref([])

const searchForm = reactive({
  keyword: '',
  status: '',
  severity: '',
  dateRange: []
})

const stats = reactive({
  pending: 15,
  processing: 8,
  completed: 42,
  rate: 2.3
})

const formData = reactive({
  ncNumber: '',
  productName: '',
  batchNumber: '',
  quantity: 1,
  defectType: '',
  severity: '',
  discoveredBy: '',
  discoveredDate: '',
  description: '',
  assignee: ''
})

const formRules = {
  ncNumber: [{ required: true, message: '请输入不合格品编号', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  batchNumber: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  defectType: [{ required: true, message: '请选择缺陷类型', trigger: 'change' }],
  severity: [{ required: true, message: '请选择严重程度', trigger: 'change' }],
  discoveredBy: [{ required: true, message: '请输入发现人', trigger: 'blur' }],
  discoveredDate: [{ required: true, message: '请选择发现日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }],
  assignee: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 100
})

const tableData = ref([
  {
    id: 1,
    ncNumber: 'NC202401001',
    productName: '精密轴承',
    batchNumber: 'B20240101',
    quantity: 50,
    defectType: '尺寸偏差',
    severity: 'major',
    status: 'pending',
    discoveredBy: '张三',
    discoveredDate: '2024-01-15',
    assignee: '李四',
    description: '轴承内径超出公差范围，影响装配',
    processRecords: [
      {
        id: 1,
        title: '不合格品登记',
        description: '发现轴承内径超出公差范围',
        operator: '张三',
        timestamp: '2024-01-15 09:30',
        type: 'primary'
      }
    ]
  },
  {
    id: 2,
    ncNumber: 'NC202401002',
    productName: '电机外壳',
    batchNumber: 'B20240102',
    quantity: 25,
    defectType: '外观缺陷',
    severity: 'minor',
    status: 'processing',
    discoveredBy: '王五',
    discoveredDate: '2024-01-16',
    assignee: '赵六',
    description: '外壳表面有划痕，影响美观',
    processRecords: [
      {
        id: 1,
        title: '不合格品登记',
        description: '发现外壳表面划痕',
        operator: '王五',
        timestamp: '2024-01-16 10:15',
        type: 'primary'
      },
      {
        id: 2,
        title: '开始处理',
        description: '分配给质量工程师进行分析',
        operator: '赵六',
        timestamp: '2024-01-16 14:20',
        type: 'success'
      }
    ]
  }
])

const formRef = ref()

// 方法
const handleSearch = () => {
  ElMessage.success('搜索功能开发中')
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const handleBatchProcess = () => {
  ElMessage.info('批量处理功能开发中')
}

const exportData = () => {
  ElMessage.success('导出数据功能开发中')
}

const viewDetail = (row) => {
  currentItem.value = row
  showDetailDialog.value = true
}

const editItem = (row) => {
  editingItem.value = row
  Object.keys(formData).forEach(key => {
    if (row[key] !== undefined) {
      formData[key] = row[key]
    }
  })
  showAddDialog.value = true
}

const handleAction = (command, row) => {
  switch (command) {
    case 'process':
      ElMessage.info('处理功能开发中')
      break
    case 'close':
      ElMessage.info('关闭功能开发中')
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
      })
      break
  }
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (editingItem.value) {
        ElMessage.success('编辑成功')
      } else {
        ElMessage.success('新增成功')
      }
      showAddDialog.value = false
      resetForm()
    }
  })
}

const resetForm = () => {
  editingItem.value = null
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'number') {
      formData[key] = 0
    } else if (Array.isArray(formData[key])) {
      formData[key] = []
    } else {
      formData[key] = ''
    }
  })
  formRef.value?.resetFields()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  // 重新加载数据
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  // 重新加载数据
}

const getSeverityType = (severity) => {
  const types = {
    critical: 'danger',
    major: 'warning',
    minor: 'info'
  }
  return types[severity] || 'info'
}

const getSeverityText = (severity) => {
  const texts = {
    critical: '严重',
    major: '重要',
    minor: '一般'
  }
  return texts[severity] || severity
}

const getSeverityClass = (severity) => {
  return `severity-${severity}`
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    closed: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    closed: '已关闭'
  }
  return texts[status] || status
}

onMounted(() => {
  console.log('不合格品管理页面已加载')
})
</script>

<style lang="scss" scoped>
.nonconforming-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 20px;
    
    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .stats-cards {
    margin-bottom: 20px;
    
    .stat-card {
      border: none;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          
          .el-icon {
            font-size: 24px;
            color: #fff;
          }
          
          &.pending {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          &.processing {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.completed {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
          
          &.rate {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }
        }
        
        .stat-info {
          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
            margin-bottom: 4px;
          }
          
        .stat-label {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .search-card,
  .table-card {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }

  .card-view {
    .nc-card {
      margin-bottom: 20px;
      border-left: 4px solid #409eff;
      
      &.severity-critical {
        border-left-color: #f56c6c;
      }
      
      &.severity-major {
        border-left-color: #e6a23c;
      }
      
      &.severity-minor {
        border-left-color: #909399;
      }
      
      .nc-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .nc-number {
          font-weight: 600;
          color: #303133;
        }
      }
      
      .nc-card-content {
        .nc-info {
          .info-item {
            display: flex;
            margin-bottom: 8px;
            
            .label {
              width: 80px;
              color: #606266;
              font-size: 14px;
            }
            
            .value {
              flex: 1;
              color: #303133;
              font-size: 14px;
            }
          }
        }
        
        .nc-actions {
          margin-top: 16px;
          text-align: right;
          
          .el-button {
            margin-left: 8px;
          }
        }
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .detail-content {
    .process-records {
      h4 {
        margin-bottom: 16px;
        color: #303133;
      }
      
      .record-content {
        .record-title {
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .record-desc {
          color: #606266;
          margin-bottom: 4px;
        }
        
        .record-operator {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
