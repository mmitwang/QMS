<template>
  <div class="final-inspection">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Finished /></el-icon>
          成品检验管理
        </h1>
        <p class="page-description">最终产品质量检验与出厂控制</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增检验
        </el-button>
        <el-button @click="batchApprove" :disabled="selectedItems.length === 0">
          <el-icon><Select /></el-icon>
          批量审批
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 质量概览 -->
    <div class="quality-overview">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in qualityMetrics" :key="index">
          <div class="metric-card" :class="item.type">
            <div class="metric-header">
              <el-icon :size="28"><component :is="item.icon" /></el-icon>
              <div class="metric-trend" :class="item.trend">
                <el-icon><component :is="item.trendIcon" /></el-icon>
                <span>{{ item.change }}</span>
              </div>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ item.value }}</div>
              <div class="metric-label">{{ item.label }}</div>
            </div>
            <div class="metric-progress">
              <el-progress 
                :percentage="item.progress" 
                :status="item.progressStatus"
                :show-text="false"
                :stroke-width="4"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 检验流程状态 -->
    <div class="process-status">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>检验流程状态</span>
            <el-button size="small" @click="refreshProcessStatus">
              <el-icon><Refresh /></el-icon>
              刷新状态
            </el-button>
          </div>
        </template>
        
        <div class="process-flow">
          <div v-for="(step, index) in processSteps" :key="index" 
               class="process-step" :class="step.status">
            <div class="step-indicator">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-icon">
                <el-icon><component :is="step.icon" /></el-icon>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-stats">
                <span>完成: {{ step.completed }}</span>
                <span>待处理: {{ step.pending }}</span>
              </div>
            </div>
            <div v-if="index < processSteps.length - 1" class="step-connector"></div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section">
      <el-card>
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="产品型号">
            <el-input v-model="searchForm.productModel" placeholder="请输入产品型号" clearable />
          </el-form-item>
          <el-form-item label="检验状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="待检验" value="pending" />
              <el-option label="检验中" value="inspecting" />
              <el-option label="合格" value="passed" />
              <el-option label="不合格" value="failed" />
              <el-option label="待复检" value="recheck" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="searchForm.priority" placeholder="请选择优先级" clearable>
              <el-option label="紧急" value="urgent" />
              <el-option label="高" value="high" />
              <el-option label="普通" value="normal" />
              <el-option label="低" value="low" />
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
            <span>成品检验记录</span>
            <div class="header-buttons">
              <el-button-group>
                <el-button size="small" @click="viewMode = 'table'" :type="viewMode === 'table' ? 'primary' : ''">
                  <el-icon><Grid /></el-icon>
                  表格
                </el-button>
                <el-button size="small" @click="viewMode = 'card'" :type="viewMode === 'card' ? 'primary' : ''">
                  <el-icon><Postcard /></el-icon>
                  卡片
                </el-button>
              </el-button-group>
              <el-button size="small" @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'">
          <el-table
            :data="inspectionList"
            v-loading="loading"
            stripe
            border
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="inspectionNo" label="检验单号" width="140" />
            <el-table-column prop="productModel" label="产品型号" width="120" />
            <el-table-column prop="productName" label="产品名称" width="150" />
            <el-table-column prop="batchNo" label="批次号" width="120" />
            <el-table-column prop="quantity" label="检验数量" width="100" align="right" />
            <el-table-column prop="priority" label="优先级" width="80">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="inspector" label="检验员" width="100" />
            <el-table-column prop="inspectionDate" label="检验日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="qualityScore" label="质量评分" width="100" align="right">
              <template #default="{ row }">
                <el-rate
                  v-model="row.qualityScore"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
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
                      <el-dropdown-item command="approve">审批通过</el-dropdown-item>
                      <el-dropdown-item command="reject">审批拒绝</el-dropdown-item>
                      <el-dropdown-item command="recheck" divided>申请复检</el-dropdown-item>
                      <el-dropdown-item command="print">打印报告</el-dropdown-item>
                      <el-dropdown-item command="export">导出数据</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 卡片视图 -->
        <div v-else class="card-view">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :lg="8" v-for="item in inspectionList" :key="item.id">
              <div class="inspection-card" :class="item.status">
                <div class="card-header">
                  <div class="card-title">
                    <span>{{ item.inspectionNo }}</span>
                    <el-tag :type="getPriorityType(item.priority)" size="small">
                      {{ getPriorityText(item.priority) }}
                    </el-tag>
                  </div>
                  <el-tag :type="getStatusType(item.status)">
                    {{ getStatusText(item.status) }}
                  </el-tag>
                </div>
                <div class="card-content">
                  <div class="product-info">
                    <h4>{{ item.productName }}</h4>
                    <p>型号: {{ item.productModel }}</p>
                    <p>批次: {{ item.batchNo }}</p>
                    <p>数量: {{ item.quantity }}</p>
                  </div>
                  <div class="inspection-info">
                    <p>检验员: {{ item.inspector }}</p>
                    <p>日期: {{ item.inspectionDate }}</p>
                    <div class="quality-score">
                      <span>质量评分:</span>
                      <el-rate
                        v-model="item.qualityScore"
                        disabled
                        show-score
                        text-color="#ff9900"
                        score-template="{value}"
                      />
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button size="small" type="primary" @click="viewDetails(item)">
                    详情
                  </el-button>
                  <el-button size="small" @click="editInspection(item)">
                    编辑
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

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
      width="900px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="检验单号" prop="inspectionNo">
                  <el-input v-model="form.inspectionNo" placeholder="自动生成" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品型号" prop="productModel">
                  <el-input v-model="form.productModel" placeholder="请输入产品型号" />
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
                <el-form-item label="优先级" prop="priority">
                  <el-select v-model="form.priority" placeholder="请选择优先级">
                    <el-option label="紧急" value="urgent" />
                    <el-option label="高" value="high" />
                    <el-option label="普通" value="normal" />
                    <el-option label="低" value="low" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
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
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="检验项目" name="items">
            <el-table :data="form.inspectionItems" border style="width: 100%">
              <el-table-column prop="category" label="检验类别" width="120">
                <template #default="{ row, $index }">
                  <el-select v-model="row.category" placeholder="类别">
                    <el-option label="外观检验" value="appearance" />
                    <el-option label="尺寸检验" value="dimension" />
                    <el-option label="功能检验" value="function" />
                    <el-option label="性能检验" value="performance" />
                    <el-option label="安全检验" value="safety" />
                  </el-select>
                </template>
              </el-table-column>
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
          </el-tab-pane>

          <el-tab-pane label="质量评价" name="quality">
            <el-form-item label="整体质量评分">
              <el-rate v-model="form.qualityScore" show-text />
            </el-form-item>
            
            <el-form-item label="质量问题">
              <el-checkbox-group v-model="form.qualityIssues">
                <el-checkbox label="外观缺陷">外观缺陷</el-checkbox>
                <el-checkbox label="尺寸偏差">尺寸偏差</el-checkbox>
                <el-checkbox label="功能异常">功能异常</el-checkbox>
                <el-checkbox label="性能不达标">性能不达标</el-checkbox>
                <el-checkbox label="安全隐患">安全隐患</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="改进建议">
              <el-input
                v-model="form.improvements"
                type="textarea"
                :rows="4"
                placeholder="请输入改进建议"
              />
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                v-model="form.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
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
  Finished, Plus, Select, Download, Search, Refresh, ArrowDown,
  Grid, Postcard, TrendCharts, DocumentChecked, Warning, Clock,
  View, Tools, Checked, Setting
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showAddDialog = ref(false)
const editingItem = ref(null)
const selectedItems = ref([])
const viewMode = ref('table')
const activeTab = ref('basic')

// 质量指标
const qualityMetrics = ref([
  {
    label: '今日检验',
    value: '28',
    icon: 'DocumentChecked',
    type: 'primary',
    trend: 'up',
    trendIcon: 'TrendCharts',
    change: '+15%',
    progress: 85,
    progressStatus: 'success'
  },
  {
    label: '合格率',
    value: '99.2%',
    icon: 'Checked',
    type: 'success',
    trend: 'up',
    trendIcon: 'TrendCharts',
    change: '+3.2%',
    progress: 99,
    progressStatus: 'success'
  },
  {
    label: '不合格品',
    value: '2',
    icon: 'Warning',
    type: 'warning',
    trend: 'down',
    trendIcon: 'TrendCharts',
    change: '-1',
    progress: 20,
    progressStatus: 'warning'
  },
  {
    label: '待审批',
    value: '5',
    icon: 'Clock',
    type: 'info',
    trend: 'stable',
    trendIcon: 'TrendCharts',
    change: '0',
    progress: 60,
    progressStatus: 'info'
  }
])

// 流程步骤
const processSteps = ref([
  {
    title: '外观检验',
    description: '产品外观质量检查',
    icon: 'View',
    status: 'completed',
    completed: 25,
    pending: 3
  },
  {
    title: '功能测试',
    description: '产品功能性能测试',
    icon: 'Tools',
    status: 'active',
    completed: 18,
    pending: 7
  },
  {
    title: '质量评价',
    description: '综合质量评价打分',
    icon: 'TrendCharts',
    status: 'pending',
    completed: 12,
    pending: 13
  },
  {
    title: '最终审批',
    description: '质量主管最终审批',
    icon: 'Checked',
    status: 'waiting',
    completed: 8,
    pending: 17
  }
])

// 搜索表单
const searchForm = reactive({
  productModel: '',
  status: '',
  priority: '',
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
    inspectionNo: 'FI20240106001',
    productModel: 'TT-WP-001',
    productName: '离心水泵',
    batchNo: 'B20240106001',
    quantity: 50,
    priority: 'high',
    inspector: '张工',
    inspectionDate: '2024-01-06',
    status: 'passed',
    qualityScore: 4.8
  },
  {
    id: 2,
    inspectionNo: 'FI20240106002',
    productModel: 'TT-MT-002',
    productName: '电机控制器',
    batchNo: 'B20240106002',
    quantity: 30,
    priority: 'urgent',
    inspector: '李工',
    inspectionDate: '2024-01-06',
    status: 'inspecting',
    qualityScore: 0
  },
  {
    id: 3,
    inspectionNo: 'FI20240106003',
    productModel: 'TT-VL-003',
    productName: '调节阀',
    batchNo: 'B20240106003',
    quantity: 100,
    priority: 'normal',
    inspector: '王工',
    inspectionDate: '2024-01-05',
    status: 'failed',
    qualityScore: 2.5
  }
])

// 表单数据
const form = reactive({
  inspectionNo: '',
  productModel: '',
  productName: '',
  batchNo: '',
  quantity: null,
  priority: 'normal',
  inspector: '',
  inspectionDate: '',
  status: 'pending',
  qualityScore: 5,
  qualityIssues: [],
  improvements: '',
  inspectionItems: [
    {
      category: '',
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
  productModel: [{ required: true, message: '请输入产品型号', trigger: 'blur' }],
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
    failed: 'danger',
    recheck: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待检验',
    inspecting: '检验中',
    passed: '合格',
    failed: '不合格',
    recheck: '待复检'
  }
  return textMap[status] || '未知'
}

const getPriorityType = (priority) => {
  const typeMap = {
    urgent: 'danger',
    high: 'warning',
    normal: 'info',
    low: 'success'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    urgent: '紧急',
    high: '高',
    normal: '普通',
    low: '低'
  }
  return textMap[priority] || '普通'
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
          category: 'appearance',
          itemName: '外观检查',
          standard: '无明显缺陷',
          actualValue: '合格',
          result: 'pass'
        }
      ]
    } else if (key === 'qualityIssues') {
      form[key] = []
    } else {
      form[key] = row[key] || (key === 'priority' ? 'normal' : key === 'qualityScore' ? 5 : '')
    }
  })
  showAddDialog.value = true
}

const batchApprove = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要审批的记录')
    return
  }
  
  ElMessageBox.confirm(`确定要批量审批通过选中的 ${selectedItems.value.length} 条记录吗？`, '批量审批', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量审批成功')
    selectedItems.value = []
    loadData()
  })
}

const handleCommand = (command, row) => {
  switch (command) {
    case 'approve':
      ElMessage.success(`审批通过: ${row.inspectionNo}`)
      break
    case 'reject':
      ElMessage.warning(`审批拒绝: ${row.inspectionNo}`)
      break
    case 'recheck':
      ElMessage.info(`申请复检: ${row.inspectionNo}`)
      break
    case 'print':
      ElMessage.success(`打印报告: ${row.inspectionNo}`)
      break
    case 'export':
      ElMessage.success(`导出数据: ${row.inspectionNo}`)
      break
  }
}

const addInspectionItem = () => {
  form.inspectionItems.push({
    category: '',
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
  activeTab.value = 'basic'
  Object.keys(form).forEach(key => {
    if (key === 'inspectionItems') {
      form[key] = [{ category: '', itemName: '', standard: '', actualValue: '', result: '' }]
    } else if (key === 'qualityIssues') {
      form[key] = []
    } else if (key === 'priority') {
      form[key] = 'normal'
    } else if (key === 'qualityScore') {
      form[key] = 5
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

const refreshProcessStatus = () => {
  ElMessage.success('流程状态已刷新')
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
  return `FI${dateStr}${random}`
}

onMounted(() => {
  loadData()
  form.inspectionNo = generateInspectionNo()
})
</script>

<style lang="scss" scoped>
.final-inspection {
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

  .quality-overview {
    margin-bottom: 20px;

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      &.primary {
        border-left: 4px solid #409EFF;
        .metric-header .el-icon { color: #409EFF; }
      }

      &.success {
        border-left: 4px solid #67C23A;
        .metric-header .el-icon { color: #67C23A; }
      }

      &.warning {
        border-left: 4px solid #E6A23C;
        .metric-header .el-icon { color: #E6A23C; }
      }

      &.info {
        border-left: 4px solid #909399;
        .metric-header .el-icon { color: #909399; }
      }

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .metric-trend {
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

      .metric-content {
        margin-bottom: 12px;

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 14px;
          color: #606266;
        }
      }

      .metric-progress {
        margin-top: 8px;
      }
    }
  }

  .process-status {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .process-flow {
      display: flex;
      align-items: center;
      padding: 20px 0;
      overflow-x: auto;

      .process-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 200px;
        position: relative;

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 12px;

          .step-number {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #E4E7ED;
            color: #909399;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
          }

          .step-icon {
            font-size: 20px;
            color: #C0C4CC;
          }
        }

        .step-content {
          text-align: center;

          .step-title {
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .step-description {
            font-size: 12px;
            color: #606266;
            margin-bottom: 8px;
          }

          .step-stats {
            font-size: 11px;
            color: #909399;

            span {
              display: block;
              margin-bottom: 2px;
            }
          }
        }

        .step-connector {
          position: absolute;
          top: 16px;
          left: 100%;
          width: 60px;
          height: 2px;
          background-color: #E4E7ED;
          z-index: 1;
        }

        &.completed {
          .step-indicator {
            .step-number {
              background-color: #67C23A;
              color: white;
            }
            .step-icon {
              color: #67C23A;
            }
          }
          .step-connector {
            background-color: #67C23A;
          }
        }

        &.active {
          .step-indicator {
            .step-number {
              background-color: #409EFF;
              color: white;
              animation: pulse 2s infinite;
            }
            .step-icon {
              color: #409EFF;
            }
          }
        }

        &.pending {
          .step-indicator {
            .step-number {
              background-color: #E6A23C;
              color: white;
            }
            .step-icon {
              color: #E6A23C;
            }
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

      .header-buttons {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .card-view {
      .inspection-card {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border-left: 4px solid #E4E7ED;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        &.passed {
          border-left-color: #67C23A;
        }

        &.failed {
          border-left-color: #F56C6C;
        }

        &.inspecting {
          border-left-color: #E6A23C;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: #303133;
          }
        }

        .card-content {
          margin-bottom: 12px;

          .product-info {
            margin-bottom: 12px;

            h4 {
              margin: 0 0 8px 0;
              color: #303133;
            }

            p {
              margin: 4px 0;
              font-size: 13px;
              color: #606266;
            }
          }

          .inspection-info {
            p {
              margin: 4px 0;
              font-size: 13px;
              color: #606266;
            }

            .quality-score {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-top: 8px;

              span {
                font-size: 13px;
                color: #606266;
              }
            }
          }
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }
      }
    }

    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

@media (max-width: 768px) {
  .final-inspection {
    padding: 10px;

    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .header-actions {
        justify-content: flex-end;
      }
    }

    .quality-overview {
      .metric-card {
        margin-bottom: 12px;
      }
    }

    .process-flow {
      flex-direction: column;

      .process-step {
        margin-bottom: 20px;

        .step-connector {
          display: none;
        }
      }
    }
  }
}
</style>
