<template>
  <div class="outgoing-inspection">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>出厂检验管理</h2>
      <p>管理产品出厂前的最终质量检验</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.pending }}</div>
                <div class="stats-label">待检验</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon processing">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.processing }}</div>
                <div class="stats-label">检验中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon passed">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.passed }}</div>
                <div class="stats-label">检验合格</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon failed">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.failed }}</div>
                <div class="stats-label">检验不合格</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 出厂流程状态 -->
    <el-card class="process-card">
      <template #header>
        <div class="card-header">
          <span>出厂检验流程</span>
        </div>
      </template>
      <div class="process-flow">
        <el-steps :active="currentStep" align-center>
          <el-step title="产品入库" description="成品入库登记"></el-step>
          <el-step title="出厂申请" description="提交出厂检验申请"></el-step>
          <el-step title="检验准备" description="准备检验设备和标准"></el-step>
          <el-step title="质量检验" description="执行出厂检验项目"></el-step>
          <el-step title="结果确认" description="确认检验结果"></el-step>
          <el-step title="放行决定" description="决定是否放行出厂"></el-step>
        </el-steps>
      </div>
    </el-card>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.productCode"
            placeholder="产品编号"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.status" placeholder="检验状态" clearable>
            <el-option label="待检验" value="pending"></el-option>
            <el-option label="检验中" value="processing"></el-option>
            <el-option label="检验合格" value="passed"></el-option>
            <el-option label="检验不合格" value="failed"></el-option>
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
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增检验
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 视图切换和批量操作 -->
    <el-card class="action-card">
      <div class="action-bar">
        <div class="view-toggle">
          <el-radio-group v-model="viewMode" @change="handleViewChange">
            <el-radio-button label="table">表格视图</el-radio-button>
            <el-radio-button label="card">卡片视图</el-radio-button>
          </el-radio-group>
        </div>
        <div class="batch-actions">
          <el-button 
            type="primary" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchApprove"
          >
            批量审批
          </el-button>
          <el-button 
            type="warning" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchReject"
          >
            批量退回
          </el-button>
          <el-dropdown @command="handleExport">
            <el-button>
              导出数据<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="excel">导出Excel</el-dropdown-item>
                <el-dropdown-item command="pdf">导出PDF</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-card>

    <!-- 表格视图 -->
    <el-card v-if="viewMode === 'table'" class="table-card">
      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="产品编号" width="120" />
        <el-table-column prop="productName" label="产品名称" width="150" />
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="inspector" label="检验员" width="100" />
        <el-table-column prop="inspectionDate" label="检验日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" size="small">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qualityScore" label="质量评分" width="100">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.qualityScore" 
              :color="getScoreColor(scope.row.qualityScore)"
              :show-text="false"
              style="width: 60px"
            />
            <span style="margin-left: 8px">{{ scope.row.qualityScore }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, scope.row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="approve">审批通过</el-dropdown-item>
                  <el-dropdown-item command="reject">审批退回</el-dropdown-item>
                  <el-dropdown-item command="print">打印报告</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <el-row :gutter="20">
        <el-col :span="8" v-for="item in tableData" :key="item.id">
          <el-card class="inspection-card" :class="{ selected: selectedRows.includes(item) }">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <el-checkbox 
                    :model-value="selectedRows.includes(item)"
                    @change="(val) => handleCardSelect(val, item)"
                  />
                  <span>{{ item.productName }}</span>
                </div>
                <el-tag :type="getStatusType(item.status)" size="small">
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="info-row">
                <span class="label">产品编号：</span>
                <span class="value">{{ item.productCode }}</span>
              </div>
              <div class="info-row">
                <span class="label">批次号：</span>
                <span class="value">{{ item.batchNo }}</span>
              </div>
              <div class="info-row">
                <span class="label">数量：</span>
                <span class="value">{{ item.quantity }} {{ item.unit }}</span>
              </div>
              <div class="info-row">
                <span class="label">检验员：</span>
                <span class="value">{{ item.inspector }}</span>
              </div>
              <div class="info-row">
                <span class="label">检验日期：</span>
                <span class="value">{{ item.inspectionDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">质量评分：</span>
                <div class="score-container">
                  <el-progress 
                    :percentage="item.qualityScore" 
                    :color="getScoreColor(item.qualityScore)"
                    :show-text="false"
                    style="width: 100px"
                  />
                  <span style="margin-left: 8px">{{ item.qualityScore }}%</span>
                </div>
              </div>
            </div>
            <div class="card-actions">
              <el-button size="small" @click="handleView(item)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEdit(item)">编辑</el-button>
              <el-button size="small" type="success" @click="handleApprove(item)">审批</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      :before-close="handleDialogClose"
    >
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="产品编号" prop="productCode">
                  <el-input v-model="form.productCode" placeholder="请输入产品编号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品名称" prop="productName">
                  <el-input v-model="form.productName" placeholder="请输入产品名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="批次号" prop="batchNo">
                  <el-input v-model="form.batchNo" placeholder="请输入批次号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生产日期" prop="productionDate">
                  <el-date-picker
                    v-model="form.productionDate"
                    type="date"
                    placeholder="选择生产日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="数量" prop="quantity">
                  <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位" prop="unit">
                  <el-select v-model="form.unit" placeholder="选择单位" style="width: 100%">
                    <el-option label="件" value="件"></el-option>
                    <el-option label="台" value="台"></el-option>
                    <el-option label="套" value="套"></el-option>
                    <el-option label="个" value="个"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="优先级" prop="priority">
                  <el-select v-model="form.priority" placeholder="选择优先级" style="width: 100%">
                    <el-option label="高" value="高"></el-option>
                    <el-option label="中" value="中"></el-option>
                    <el-option label="低" value="低"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="检验员" prop="inspector">
                  <el-select v-model="form.inspector" placeholder="选择检验员" style="width: 100%">
                    <el-option label="张三" value="张三"></el-option>
                    <el-option label="李四" value="李四"></el-option>
                    <el-option label="王五" value="王五"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="检验日期" prop="inspectionDate">
                  <el-date-picker
                    v-model="form.inspectionDate"
                    type="date"
                    placeholder="选择检验日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 检验项目 -->
        <el-tab-pane label="检验项目" name="inspection">
          <div class="inspection-items">
            <div class="items-header">
              <el-button type="primary" size="small" @click="addInspectionItem">
                <el-icon><Plus /></el-icon>
                添加检验项目
              </el-button>
            </div>
            <el-table :data="form.inspectionItems" style="width: 100%">
              <el-table-column prop="itemName" label="检验项目" width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.itemName" placeholder="检验项目名称" />
                </template>
              </el-table-column>
              <el-table-column prop="standard" label="检验标准" width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.standard" placeholder="检验标准" />
                </template>
              </el-table-column>
              <el-table-column prop="method" label="检验方法" width="150">
                <template #default="scope">
                  <el-select v-model="scope.row.method" placeholder="选择方法">
                    <el-option label="目视检查" value="目视检查"></el-option>
                    <el-option label="尺寸测量" value="尺寸测量"></el-option>
                    <el-option label="功能测试" value="功能测试"></el-option>
                    <el-option label="性能测试" value="性能测试"></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="result" label="检验结果" width="120">
                <template #default="scope">
                  <el-select v-model="scope.row.result" placeholder="选择结果">
                    <el-option label="合格" value="合格"></el-option>
                    <el-option label="不合格" value="不合格"></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注">
                <template #default="scope">
                  <el-input v-model="scope.row.remark" placeholder="备注" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="removeInspectionItem(scope.$index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 质量评价 -->
        <el-tab-pane label="质量评价" name="evaluation">
          <el-form :model="form" label-width="120px">
            <el-form-item label="整体质量评分">
              <el-slider
                v-model="form.qualityScore"
                :min="0"
                :max="100"
                show-input
                :format-tooltip="(val) => `${val}%`"
              />
            </el-form-item>
            <el-form-item label="外观质量">
              <el-rate v-model="form.appearanceRating" :max="5" show-text />
            </el-form-item>
            <el-form-item label="功能性能">
              <el-rate v-model="form.performanceRating" :max="5" show-text />
            </el-form-item>
            <el-form-item label="包装质量">
              <el-rate v-model="form.packagingRating" :max="5" show-text />
            </el-form-item>
            <el-form-item label="质量问题">
              <el-checkbox-group v-model="form.qualityIssues">
                <el-checkbox label="外观缺陷">外观缺陷</el-checkbox>
                <el-checkbox label="尺寸偏差">尺寸偏差</el-checkbox>
                <el-checkbox label="功能异常">功能异常</el-checkbox>
                <el-checkbox label="包装破损">包装破损</el-checkbox>
                <el-checkbox label="标识错误">标识错误</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="改进建议">
              <el-input
                v-model="form.improvementSuggestions"
                type="textarea"
                :rows="4"
                placeholder="请输入改进建议"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  Loading,
  Select,
  Close,
  Search,
  Plus,
  ArrowDown
} from '@element-plus/icons-vue'

// 响应式数据
const stats = reactive({
  pending: 15,
  processing: 8,
  passed: 142,
  failed: 6
})

const currentStep = ref(3)
const viewMode = ref('table')
const selectedRows = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增出厂检验')
const activeTab = ref('basic')

const searchForm = reactive({
  productCode: '',
  status: '',
  dateRange: []
})

const form = reactive({
  id: null,
  productCode: '',
  productName: '',
  batchNo: '',
  productionDate: '',
  quantity: 1,
  unit: '件',
  priority: '中',
  inspector: '',
  inspectionDate: '',
  remark: '',
  qualityScore: 85,
  appearanceRating: 4,
  performanceRating: 4,
  packagingRating: 4,
  qualityIssues: [],
  improvementSuggestions: '',
  inspectionItems: []
})

const rules = {
  productCode: [{ required: true, message: '请输入产品编号', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  inspector: [{ required: true, message: '请选择检验员', trigger: 'change' }],
  inspectionDate: [{ required: true, message: '请选择检验日期', trigger: 'change' }]
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

const tableData = ref([
  {
    id: 1,
    productCode: 'P001',
    productName: '智能手机',
    batchNo: 'B20240101',
    quantity: 100,
    unit: '台',
    inspector: '张三',
    inspectionDate: '2024-01-15',
    status: 'passed',
    priority: '高',
    qualityScore: 95
  },
  {
    id: 2,
    productCode: 'P002',
    productName: '平板电脑',
    batchNo: 'B20240102',
    quantity: 50,
    unit: '台',
    inspector: '李四',
    inspectionDate: '2024-01-16',
    status: 'processing',
    priority: '中',
    qualityScore: 88
  },
  {
    id: 3,
    productCode: 'P003',
    productName: '智能手表',
    batchNo: 'B20240103',
    quantity: 200,
    unit: '个',
    inspector: '王五',
    inspectionDate: '2024-01-17',
    status: 'failed',
    priority: '高',
    qualityScore: 65
  }
])

const formRef = ref()

// 方法
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    processing: 'primary',
    passed: 'success',
    failed: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待检验',
    processing: '检验中',
    passed: '检验合格',
    failed: '检验不合格'
  }
  return texts[status] || '未知'
}

const getPriorityType = (priority) => {
  const types = {
    高: 'danger',
    中: 'warning',
    低: 'info'
  }
  return types[priority] || 'info'
}

const getScoreColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#e6a23c'
  if (score >= 70) return '#f56c6c'
  return '#909399'
}

const handleSearch = () => {
  console.log('搜索', searchForm)
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  Object.assign(searchForm, {
    productCode: '',
    status: '',
    dateRange: []
  })
  ElMessage.success('重置完成')
}

const handleAdd = () => {
  dialogTitle.value = '新增出厂检验'
  resetForm()
  dialogVisible.value = true
}

const handleView = (row) => {
  console.log('查看', row)
  ElMessage.info('查看功能开发中')
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑出厂检验'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确认审批通过该检验记录？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('审批通过')
  })
}

const handleMoreAction = (command, row) => {
  switch (command) {
    case 'approve':
      handleApprove(row)
      break
    case 'reject':
      ElMessage.warning('审批退回功能开发中')
      break
    case 'print':
      ElMessage.info('打印报告功能开发中')
      break
    case 'delete':
      ElMessageBox.confirm('确认删除该检验记录？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
      })
      break
  }
}

const handleViewChange = (mode) => {
  viewMode.value = mode
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleCardSelect = (val, item) => {
  if (val) {
    if (!selectedRows.value.includes(item)) {
      selectedRows.value.push(item)
    }
  } else {
    const index = selectedRows.value.indexOf(item)
    if (index > -1) {
      selectedRows.value.splice(index, 1)
    }
  }
}

const handleBatchApprove = () => {
  ElMessageBox.confirm(`确认批量审批通过选中的 ${selectedRows.value.length} 条记录？`, '批量审批', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量审批完成')
    selectedRows.value = []
  })
}

const handleBatchReject = () => {
  ElMessageBox.confirm(`确认批量退回选中的 ${selectedRows.value.length} 条记录？`, '批量退回', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量退回完成')
    selectedRows.value = []
  })
}

const handleExport = (command) => {
  switch (command) {
    case 'excel':
      ElMessage.success('导出Excel功能开发中')
      break
    case 'pdf':
      ElMessage.success('导出PDF功能开发中')
      break
  }
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  console.log('页面大小改变', size)
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  console.log('当前页改变', page)
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    productCode: '',
    productName: '',
    batchNo: '',
    productionDate: '',
    quantity: 1,
    unit: '件',
    priority: '中',
    inspector: '',
    inspectionDate: '',
    remark: '',
    qualityScore: 85,
    appearanceRating: 4,
    performanceRating: 4,
    packagingRating: 4,
    qualityIssues: [],
    improvementSuggestions: '',
    inspectionItems: []
  })
}

const addInspectionItem = () => {
  form.inspectionItems.push({
    itemName: '',
    standard: '',
    method: '',
    result: '',
    remark: ''
  })
}

const removeInspectionItem = (index) => {
  form.inspectionItems.splice(index, 1)
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('提交表单', form)
      ElMessage.success('保存成功')
      dialogVisible.value = false
      resetForm()
    }
  })
}

onMounted(() => {
  console.log('出厂检验管理页面已加载')
})
</script>

<style lang="scss" scoped>
.outgoing-inspection {
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
    
    .stats-card {
      border: none;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
      .stats-content {
        display: flex;
        align-items: center;
        
        .stats-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          
          &.pending {
            background-color: #fdf6ec;
            color: #e6a23c;
          }
          
          &.processing {
            background-color: #ecf5ff;
            color: #409eff;
          }
          
          &.passed {
            background-color: #f0f9ff;
            color: #67c23a;
          }
          
          &.failed {
            background-color: #fef0f0;
            color: #f56c6c;
          }
        }
        
        .stats-info {
          .stats-number {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
            margin-bottom: 4px;
          }
          
          .stats-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .process-card {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .card-header {
      font-weight: 600;
      color: #303133;
    }
    
    .process-flow {
      padding: 20px 0;
    }
  }

  .search-card,
  .action-card,
  .table-card {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .batch-actions {
      display: flex;
      gap: 12px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .card-view {
    .inspection-card {
      margin-bottom: 20px;
      border: none;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
      
      &.selected {
        border: 2px solid #409eff;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #303133;
        }
      }
      
      .card-content {
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .label {
            color: #909399;
            font-size: 14px;
            min-width: 80px;
          }
          
          .value {
            color: #303133;
            font-weight: 500;
          }
          
          .score-container {
            display: flex;
            align-items: center;
          }
        }
      }
      
      .card-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #ebeef5;
      }
    }
  }

  .inspection-items {
    .items-header {
      margin-bottom: 16px;
    }
  }

  :deep(.el-dialog) {
    .el-dialog__body {
      padding: 20px;
    }
    
    .el-tabs__content {
      padding: 20px 0;
    }
  }

  :deep(.el-table) {
    .el-table__header {
      th {
        background-color: #fafafa;
        color: #303133;
        font-weight: 600;
      }
    }
  }

  :deep(.el-card__header) {
    padding: 18px 20px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fafafa;
  }

  :deep(.el-steps) {
    .el-step__title {
      font-size: 14px;
      font-weight: 500;
    }
    
    .el-step__description {
      font-size: 12px;
    }
  }
}
</style>
