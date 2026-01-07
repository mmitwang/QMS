<template>
  <div class="process-inspection">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Tools /></el-icon>
          过程检验管理
        </h1>
        <p class="page-description">生产过程中的质量检验与控制</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增检验
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in stats" :key="index">
          <div class="stat-card" :class="stat.type">
            <div class="stat-icon">
              <el-icon :size="32"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" :class="stat.trend">
                <el-icon><component :is="stat.trendIcon" /></el-icon>
                <span>{{ stat.trendValue }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-card>
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="工序名称">
            <el-input v-model="searchForm.processName" placeholder="请输入工序名称" clearable />
          </el-form-item>
          <el-form-item label="检验状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="待检验" value="pending" />
              <el-option label="检验中" value="inspecting" />
              <el-option label="合格" value="passed" />
              <el-option label="不合格" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="检验日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 检验列表 -->
    <div class="inspection-table">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>过程检验记录</span>
            <div class="header-buttons">
              <el-button size="small" @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="inspectionList"
          v-loading="loading"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="inspectionNo" label="检验单号" width="150" />
          <el-table-column prop="processName" label="工序名称" width="120" />
          <el-table-column prop="productName" label="产品名称" width="150" />
          <el-table-column prop="batchNo" label="批次号" width="120" />
          <el-table-column prop="quantity" label="检验数量" width="100" align="right" />
          <el-table-column prop="inspector" label="检验员" width="100" />
          <el-table-column prop="inspectionDate" label="检验日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="passRate" label="合格率" width="100" align="right">
            <template #default="{ row }">
              <span :class="getPassRateClass(row.passRate)">{{ row.passRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewDetails(row)">
                详情
              </el-button>
              <el-button size="small" @click="editInspection(row)">
                编辑
              </el-button>
              <el-dropdown @command="(command) => handleCommand(command, row)">
                <el-button size="small">
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="print">打印报告</el-dropdown-item>
                    <el-dropdown-item command="export">导出数据</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

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
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingItem ? '编辑检验记录' : '新增检验记录'"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验单号" prop="inspectionNo">
              <el-input v-model="form.inspectionNo" placeholder="自动生成" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工序名称" prop="processName">
              <el-select v-model="form.processName" placeholder="请选择工序">
                <el-option label="机加工" value="machining" />
                <el-option label="装配" value="assembly" />
                <el-option label="焊接" value="welding" />
                <el-option label="喷涂" value="painting" />
                <el-option label="包装" value="packaging" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="form.productName" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="form.batchNo" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验数量" prop="quantity">
              <el-input-number v-model="form.quantity" :min="1" placeholder="请输入检验数量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验员" prop="inspector">
              <el-select v-model="form.inspector" placeholder="请选择检验员">
                <el-option label="张工" value="张工" />
                <el-option label="李工" value="李工" />
                <el-option label="王工" value="王工" />
                <el-option label="赵工" value="赵工" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验日期" prop="inspectionDate">
              <el-date-picker
                v-model="form.inspectionDate"
                type="date"
                placeholder="请选择检验日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option label="待检验" value="pending" />
                <el-option label="检验中" value="inspecting" />
                <el-option label="合格" value="passed" />
                <el-option label="不合格" value="failed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="检验项目">
          <el-table :data="form.inspectionItems" border style="width: 100%">
            <el-table-column prop="itemName" label="检验项目" width="150">
              <template #default="{ row, $index }">
                <el-input v-model="row.itemName" placeholder="检验项目" />
              </template>
            </el-table-column>
            <el-table-column prop="standard" label="标准要求" width="150">
              <template #default="{ row, $index }">
                <el-input v-model="row.standard" placeholder="标准要求" />
              </template>
            </el-table-column>
            <el-table-column prop="actualValue" label="实测值" width="120">
              <template #default="{ row, $index }">
                <el-input v-model="row.actualValue" placeholder="实测值" />
              </template>
            </el-table-column>
            <el-table-column prop="result" label="检验结果" width="100">
              <template #default="{ row, $index }">
                <el-select v-model="row.result" placeholder="结果">
                  <el-option label="合格" value="pass" />
                  <el-option label="不合格" value="fail" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row, $index }">
                <el-button size="small" type="danger" @click="removeInspectionItem($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" size="small" @click="addInspectionItem" style="margin-top: 10px">
            添加检验项目
          </el-button>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Tools, Plus, Download, Search, Refresh, ArrowDown,
  TrendCharts, DocumentChecked, Warning, Clock
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showAddDialog = ref(false)
const editingItem = ref(null)
const selectedItems = ref([])

// 统计数据
const stats = ref([
  {
    label: '今日检验',
    value: '45',
    icon: 'DocumentChecked',
    type: 'primary',
    trend: 'up',
    trendIcon: 'TrendCharts',
    trendValue: '+12%'
  },
  {
    label: '合格率',
    value: '97.8%',
    icon: 'TrendCharts',
    type: 'success',
    trend: 'up',
    trendIcon: 'TrendCharts',
    trendValue: '+2.1%'
  },
  {
    label: '不合格品',
    value: '8',
    icon: 'Warning',
    type: 'warning',
    trend: 'down',
    trendIcon: 'TrendCharts',
    trendValue: '-3'
  },
  {
    label: '待检验',
    value: '12',
    icon: 'Clock',
    type: 'info',
    trend: 'stable',
    trendIcon: 'TrendCharts',
    trendValue: '0'
  }
])

// 搜索表单
const searchForm = reactive({
  processName: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 检验列表
const inspectionList = ref([
  {
    id: 1,
    inspectionNo: 'PI20240106001',
    processName: '机加工',
    productName: '电机外壳',
    batchNo: 'B20240106001',
    quantity: 100,
    inspector: '张工',
    inspectionDate: '2024-01-06',
    status: 'passed',
    passRate: 98.5
  },
  {
    id: 2,
    inspectionNo: 'PI20240106002',
    processName: '装配',
    productName: '水泵组件',
    batchNo: 'B20240106002',
    quantity: 50,
    inspector: '李工',
    inspectionDate: '2024-01-06',
    status: 'inspecting',
    passRate: 0
  },
  {
    id: 3,
    inspectionNo: 'PI20240106003',
    processName: '焊接',
    productName: '管道接头',
    batchNo: 'B20240106003',
    quantity: 200,
    inspector: '王工',
    inspectionDate: '2024-01-05',
    status: 'failed',
    passRate: 85.5
  }
])

// 表单数据
const form = reactive({
  inspectionNo: '',
  processName: '',
  productName: '',
  batchNo: '',
  quantity: null,
  inspector: '',
  inspectionDate: '',
  status: 'pending',
  inspectionItems: [
    {
      itemName: '',
      standard: '',
      actualValue: '',
      result: ''
    }
  ],
  remarks: ''
})

// 表单验证规则
const formRules = {
  processName: [{ required: true, message: '请选择工序名称', trigger: 'change' }],
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入检验数量', trigger: 'blur' }],
  inspector: [{ required: true, message: '请选择检验员', trigger: 'change' }],
  inspectionDate: [{ required: true, message: '请选择检验日期', trigger: 'change' }]
}

const formRef = ref()

// 方法
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    inspecting: 'warning',
    passed: 'success',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待检验',
    inspecting: '检验中',
    passed: '合格',
    failed: '不合格'
  }
  return textMap[status] || '未知'
}

const getPassRateClass = (rate) => {
  if (rate >= 95) return 'pass-rate-excellent'
  if (rate >= 90) return 'pass-rate-good'
  if (rate >= 80) return 'pass-rate-warning'
  return 'pass-rate-danger'
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = Array.isArray(searchForm[key]) ? [] : ''
  })
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadData()
}

const viewDetails = (row) => {
  ElMessage.info(`查看检验详情: ${row.inspectionNo}`)
}

const editInspection = (row) => {
  editingItem.value = row
  Object.keys(form).forEach(key => {
    if (key === 'inspectionItems') {
      form[key] = [
        {
          itemName: '尺寸检验',
          standard: '±0.1mm',
          actualValue: '0.05mm',
          result: 'pass'
        }
      ]
    } else {
      form[key] = row[key] || ''
    }
  })
  showAddDialog.value = true
}

const handleCommand = (command, row) => {
  switch (command) {
    case 'print':
      ElMessage.success(`打印报告: ${row.inspectionNo}`)
      break
    case 'export':
      ElMessage.success(`导出数据: ${row.inspectionNo}`)
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除这条检验记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
      })
      break
  }
}

const addInspectionItem = () => {
  form.inspectionItems.push({
    itemName: '',
    standard: '',
    actualValue: '',
    result: ''
  })
}

const removeInspectionItem = (index) => {
  if (form.inspectionItems.length > 1) {
    form.inspectionItems.splice(index, 1)
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 模拟提交
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(editingItem.value ? '更新成功' : '添加成功')
    showAddDialog.value = false
    loadData()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingItem.value = null
  Object.keys(form).forEach(key => {
    if (key === 'inspectionItems') {
      form[key] = [{ itemName: '', standard: '', actualValue: '', result: '' }]
    } else if (key === 'status') {
      form[key] = 'pending'
    } else {
      form[key] = ''
    }
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const refreshData = () => {
  loadData()
}

const exportData = () => {
  ElMessage.success('导出功能开发中...')
}

const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = inspectionList.value.length
  } finally {
    loading.value = false
  }
}

// 生成检验单号
const generateInspectionNo = () => {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `PI${dateStr}${random}`
}

onMounted(() => {
  loadData()
  form.inspectionNo = generateInspectionNo()
})
</script>

<style lang="scss" scoped>
.process-inspection {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .header-content {
      .page-title {
        display: flex;
        align-items: center;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;

        .el-icon {
          margin-right: 8px;
          color: #409EFF;
        }
      }

      .page-description {
        color: #606266;
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      &.primary {
        border-left: 4px solid #409EFF;
        .stat-icon { color: #409EFF; }
      }

      &.success {
        border-left: 4px solid #67C23A;
        .stat-icon { color: #67C23A; }
      }

      &.warning {
        border-left: 4px solid #E6A23C;
        .stat-icon { color: #E6A23C; }
      }

      &.info {
        border-left: 4px solid #909399;
        .stat-icon { color: #909399; }
      }

      .stat-icon {
        margin-right: 16px;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          font-size: 12px;

          &.up { color: #67C23A; }
          &.down { color: #F56C6C; }
          &.stable { color: #909399; }

          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .search-section {
    margin-bottom: 20px;

    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .inspection-table {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }
  }

  .pass-rate-excellent { color: #67C23A; font-weight: 600; }
  .pass-rate-good { color: #409EFF; font-weight: 600; }
  .pass-rate-warning { color: #E6A23C; font-weight: 600; }
  .pass-rate-danger { color: #F56C6C; font-weight: 600; }
}

@media (max-width: 768px) {
  .process-inspection {
    padding: 10px;

    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .header-actions {
        justify-content: flex-end;
      }
    }

    .stats-cards {
      .stat-card {
        margin-bottom: 12px;
      }
    }
  }
}
</style>
