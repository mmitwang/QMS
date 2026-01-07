<template>
  <div class="supplier-quality">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>供应商质量管理</h2>
      <p>管理供应商质量评估、审核和持续改进</p>
    </div>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon suppliers">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalSuppliers }}</div>
              <div class="stat-label">供应商总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon qualified">
              <el-icon><Medal /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.qualifiedSuppliers }}</div>
              <div class="stat-label">合格供应商</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon audits">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingAudits }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon score">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgScore }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 功能标签页 -->
    <el-card class="tabs-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 供应商列表 -->
        <el-tab-pane label="供应商列表" name="suppliers">
          <div class="suppliers-content">
            <!-- 搜索栏 -->
            <div class="search-bar">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-input
                    v-model="supplierSearch.keyword"
                    placeholder="搜索供应商名称、编码"
                    clearable
                    @keyup.enter="searchSuppliers"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="supplierSearch.category" placeholder="供应商类别" clearable>
                    <el-option label="原材料" value="material" />
                    <el-option label="零部件" value="component" />
                    <el-option label="设备" value="equipment" />
                    <el-option label="服务" value="service" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="supplierSearch.level" placeholder="质量等级" clearable>
                    <el-option label="A级" value="A" />
                    <el-option label="B级" value="B" />
                    <el-option label="C级" value="C" />
                    <el-option label="D级" value="D" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="supplierSearch.status" placeholder="状态" clearable>
                    <el-option label="合格" value="qualified" />
                    <el-option label="待审核" value="pending" />
                    <el-option label="不合格" value="unqualified" />
                    <el-option label="暂停" value="suspended" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-button type="primary" @click="searchSuppliers">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetSupplierSearch">重置</el-button>
                  <el-button type="success" @click="showAddSupplierDialog = true">
                    <el-icon><Plus /></el-icon>
                    新增供应商
                  </el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 供应商表格 -->
            <el-table :data="supplierData" style="width: 100%" row-key="id">
              <el-table-column prop="code" label="供应商编码" width="120" />
              <el-table-column prop="name" label="供应商名称" width="200" />
              <el-table-column prop="category" label="类别" width="100" />
              <el-table-column prop="contact" label="联系人" width="100" />
              <el-table-column prop="phone" label="联系电话" width="130" />
              <el-table-column prop="level" label="质量等级" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getLevelType(scope.row.level)">
                    {{ scope.row.level }}级
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="质量评分" width="100" align="center">
                <template #default="scope">
                  <span :class="getScoreClass(scope.row.score)">
                    {{ scope.row.score }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getSupplierStatusType(scope.row.status)">
                    {{ getSupplierStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastAuditDate" label="最近审核" width="120" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewSupplierDetail(scope.row)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button size="small" type="primary" @click="editSupplier(scope.row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button size="small" type="warning" @click="auditSupplier(scope.row)">
                    <el-icon><DocumentChecked /></el-icon>
                    审核
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 质量评估 -->
        <el-tab-pane label="质量评估" name="assessment">
          <div class="assessment-content">
            <el-row :gutter="20">
              <el-col :span="16">
                <!-- 评估表单 -->
                <el-card class="assessment-form">
                  <template #header>
                    <div class="card-header">
                      <span>供应商质量评估</span>
                      <el-button type="primary" @click="saveAssessment">
                        <el-icon><DocumentAdd /></el-icon>
                        保存评估
                      </el-button>
                    </div>
                  </template>
                  <el-form :model="assessmentForm" :rules="assessmentRules" ref="assessmentFormRef" label-width="120px">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="供应商" prop="supplierId">
                          <el-select v-model="assessmentForm.supplierId" placeholder="选择供应商" style="width: 100%">
                            <el-option
                              v-for="supplier in supplierData"
                              :key="supplier.id"
                              :label="supplier.name"
                              :value="supplier.id"
                            />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="评估日期" prop="assessmentDate">
                          <el-date-picker
                            v-model="assessmentForm.assessmentDate"
                            type="date"
                            placeholder="选择评估日期"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    
                    <!-- 评估指标 -->
                    <div class="assessment-criteria">
                      <h4>评估指标</h4>
                      <div v-for="(criterion, index) in assessmentCriteria" :key="index" class="criterion-item">
                        <div class="criterion-header">
                          <span class="criterion-name">{{ criterion.name }}</span>
                          <span class="criterion-weight">权重: {{ criterion.weight }}%</span>
                        </div>
                        <el-rate
                          v-model="criterion.score"
                          :max="5"
                          show-score
                          text-color="#ff9900"
                          score-template="{value} 分"
                        />
                        <el-input
                          v-model="criterion.comment"
                          type="textarea"
                          :rows="2"
                          placeholder="评估说明"
                          style="margin-top: 8px;"
                        />
                      </div>
                    </div>
                    
                    <el-form-item label="总体评价" prop="overallComment">
                      <el-input
                        v-model="assessmentForm.overallComment"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入总体评价"
                      />
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
              
              <el-col :span="8">
                <!-- 评估结果 -->
                <el-card class="assessment-result">
                  <template #header>
                    <span>评估结果</span>
                  </template>
                  <div class="result-content">
                    <div class="total-score">
                      <div class="score-label">综合评分</div>
                      <div class="score-value" :class="getScoreClass(totalScore)">
                        {{ totalScore.toFixed(1) }}
                      </div>
                    </div>
                    <div class="score-breakdown">
                      <div class="breakdown-title">评分明细</div>
                      <div v-for="(criterion, index) in assessmentCriteria" :key="index" class="breakdown-item">
                        <span class="item-name">{{ criterion.name }}</span>
                        <span class="item-score">{{ (criterion.score * criterion.weight / 100).toFixed(1) }}</span>
                      </div>
                    </div>
                    <div class="quality-level">
                      <div class="level-label">质量等级</div>
                      <el-tag :type="getLevelType(qualityLevel)" size="large">
                        {{ qualityLevel }}级
                      </el-tag>
                    </div>
                  </div>
                </el-card>
                
                <!-- 历史评估 -->
                <el-card class="history-assessments" style="margin-top: 20px;">
                  <template #header>
                    <span>历史评估</span>
                  </template>
                  <el-timeline>
                    <el-timeline-item
                      v-for="history in assessmentHistory"
                      :key="history.id"
                      :timestamp="history.date"
                      :type="getLevelType(history.level)"
                    >
                      <div class="history-content">
                        <div class="history-score">评分: {{ history.score }}</div>
                        <div class="history-level">等级: {{ history.level }}级</div>
                        <div class="history-assessor">评估人: {{ history.assessor }}</div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 审核管理 -->
        <el-tab-pane label="审核管理" name="audit">
          <div class="audit-content">
            <!-- 审核计划 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="audit-plan">
                  <template #header>
                    <div class="card-header">
                      <span>审核计划</span>
                      <el-button type="primary" @click="showAuditPlanDialog = true">
                        <el-icon><Plus /></el-icon>
                        新增计划
                      </el-button>
                    </div>
                  </template>
                  <el-table :data="auditPlans" style="width: 100%">
                    <el-table-column prop="supplierName" label="供应商" width="150" />
                    <el-table-column prop="auditType" label="审核类型" width="100" />
                    <el-table-column prop="plannedDate" label="计划日期" width="120" />
                    <el-table-column prop="status" label="状态" width="100" align="center">
                      <template #default="scope">
                        <el-tag :type="getAuditStatusType(scope.row.status)">
                          {{ getAuditStatusText(scope.row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120">
                      <template #default="scope">
                        <el-button size="small" @click="executeAudit(scope.row)">执行</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </el-col>
              
              <el-col :span="12">
                <el-card class="audit-results">
                  <template #header>
                    <span>审核结果</span>
                  </template>
                  <el-table :data="auditResults" style="width: 100%">
                    <el-table-column prop="supplierName" label="供应商" width="150" />
                    <el-table-column prop="auditDate" label="审核日期" width="120" />
                    <el-table-column prop="result" label="审核结果" width="100" align="center">
                      <template #default="scope">
                        <el-tag :type="getAuditResultType(scope.row.result)">
                          {{ scope.row.result }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="score" label="评分" width="80" align="center" />
                    <el-table-column label="操作" width="100">
                      <template #default="scope">
                        <el-button size="small" @click="viewAuditDetail(scope.row)">查看</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 改进跟踪 -->
        <el-tab-pane label="改进跟踪" name="improvement">
          <div class="improvement-content">
            <el-card class="improvement-tracking">
              <template #header>
                <div class="card-header">
                  <span>改进措施跟踪</span>
                  <el-button type="primary" @click="showImprovementDialog = true">
                    <el-icon><Plus /></el-icon>
                    新增改进措施
                  </el-button>
                </div>
              </template>
              <el-table :data="improvementActions" style="width: 100%">
                <el-table-column prop="supplierName" label="供应商" width="150" />
                <el-table-column prop="issue" label="问题描述" width="200" />
                <el-table-column prop="action" label="改进措施" width="200" />
                <el-table-column prop="responsible" label="负责人" width="100" />
                <el-table-column prop="dueDate" label="完成期限" width="120" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getImprovementStatusType(scope.row.status)">
                      {{ getImprovementStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="progress" label="进度" width="120" align="center">
                  <template #default="scope">
                    <el-progress :percentage="scope.row.progress" :stroke-width="8" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" @click="updateProgress(scope.row)">更新进度</el-button>
                    <el-button size="small" type="success" @click="completeImprovement(scope.row)">完成</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增供应商对话框 -->
    <el-dialog v-model="showAddSupplierDialog" title="新增供应商" width="600px">
      <el-form :model="supplierForm" :rules="supplierRules" ref="supplierFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商编码" prop="code">
              <el-input v-model="supplierForm.code" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商名称" prop="name">
              <el-input v-model="supplierForm.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类别" prop="category">
              <el-select v-model="supplierForm.category" placeholder="选择类别" style="width: 100%">
                <el-option label="原材料" value="material" />
                <el-option label="零部件" value="component" />
                <el-option label="设备" value="equipment" />
                <el-option label="服务" value="service" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="supplierForm.contact" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="supplierForm.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="supplierForm.email" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="address">
          <el-input v-model="supplierForm.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddSupplierDialog = false">取消</el-button>
          <el-button type="primary" @click="saveSupplier">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  View,
  DocumentAdd,
  DocumentChecked,
  OfficeBuilding,
  Medal,
  TrendCharts
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('suppliers')
const showAddSupplierDialog = ref(false)
const showAuditPlanDialog = ref(false)
const showImprovementDialog = ref(false)

const stats = reactive({
  totalSuppliers: 156,
  qualifiedSuppliers: 142,
  pendingAudits: 8,
  avgScore: 8.6
})

const supplierSearch = reactive({
  keyword: '',
  category: '',
  level: '',
  status: ''
})

const supplierForm = reactive({
  code: '',
  name: '',
  category: '',
  contact: '',
  phone: '',
  email: '',
  address: ''
})

const supplierRules = {
  code: [{ required: true, message: '请输入供应商编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const assessmentForm = reactive({
  supplierId: '',
  assessmentDate: '',
  overallComment: ''
})

const assessmentRules = {
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  assessmentDate: [{ required: true, message: '请选择评估日期', trigger: 'change' }]
}

const assessmentCriteria = ref([
  { name: '质量管理体系', weight: 25, score: 0, comment: '' },
  { name: '产品质量', weight: 30, score: 0, comment: '' },
  { name: '交付能力', weight: 20, score: 0, comment: '' },
  { name: '技术能力', weight: 15, score: 0, comment: '' },
  { name: '服务水平', weight: 10, score: 0, comment: '' }
])

const supplierData = ref([
  {
    id: 1,
    code: 'SUP001',
    name: '精密机械有限公司',
    category: '零部件',
    contact: '张经理',
    phone: '138-0000-0001',
    level: 'A',
    score: 9.2,
    status: 'qualified',
    lastAuditDate: '2024-01-10'
  },
  {
    id: 2,
    code: 'SUP002',
    name: '优质材料供应商',
    category: '原材料',
    contact: '李总',
    phone: '138-0000-0002',
    level: 'B',
    score: 8.5,
    status: 'qualified',
    lastAuditDate: '2024-01-08'
  }
])

const auditPlans = ref([
  {
    id: 1,
    supplierName: '精密机械有限公司',
    auditType: '年度审核',
    plannedDate: '2024-02-15',
    status: 'planned'
  }
])

const auditResults = ref([
  {
    id: 1,
    supplierName: '精密机械有限公司',
    auditDate: '2024-01-10',
    result: '通过',
    score: 92
  }
])

const improvementActions = ref([
  {
    id: 1,
    supplierName: '优质材料供应商',
    issue: '交付延迟问题',
    action: '优化生产计划，建立缓冲库存',
    responsible: '李总',
    dueDate: '2024-02-28',
    status: 'in_progress',
    progress: 65
  }
])

const assessmentHistory = ref([
  {
    id: 1,
    date: '2024-01-10',
    score: 9.2,
    level: 'A',
    assessor: '质量部-王工'
  },
  {
    id: 2,
    date: '2023-07-15',
    score: 8.8,
    level: 'B',
    assessor: '质量部-张工'
  }
])

const supplierFormRef = ref()
const assessmentFormRef = ref()

// 计算属性
const totalScore = computed(() => {
  return assessmentCriteria.value.reduce((total, criterion) => {
    return total + (criterion.score * criterion.weight / 100)
  }, 0)
})

const qualityLevel = computed(() => {
  const score = totalScore.value
  if (score >= 4.5) return 'A'
  if (score >= 3.5) return 'B'
  if (score >= 2.5) return 'C'
  return 'D'
})

// 方法
const handleTabClick = (tab) => {
  console.log('切换到标签页:', tab.name)
}

const searchSuppliers = () => {
  ElMessage.success('搜索供应商功能开发中')
}

const resetSupplierSearch = () => {
  Object.keys(supplierSearch).forEach(key => {
    supplierSearch[key] = ''
  })
}

const viewSupplierDetail = (supplier) => {
  ElMessage.info(`查看供应商详情: ${supplier.name}`)
}

const editSupplier = (supplier) => {
  ElMessage.info(`编辑供应商: ${supplier.name}`)
}

const auditSupplier = (supplier) => {
  ElMessage.info(`审核供应商: ${supplier.name}`)
}

const saveSupplier = () => {
  supplierFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('供应商保存成功')
      showAddSupplierDialog.value = false
    }
  })
}

const saveAssessment = () => {
  assessmentFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('质量评估保存成功')
    }
  })
}

const executeAudit = (plan) => {
  ElMessage.info(`执行审核: ${plan.supplierName}`)
}

const viewAuditDetail = (result) => {
  ElMessage.info(`查看审核详情: ${result.supplierName}`)
}

const updateProgress = (action) => {
  ElMessage.info(`更新改进进度: ${action.supplierName}`)
}

const completeImprovement = (action) => {
  ElMessage.success(`完成改进措施: ${action.supplierName}`)
}

const getLevelType = (level) => {
  const types = {
    A: 'success',
    B: 'primary',
    C: 'warning',
    D: 'danger'
  }
  return types[level] || 'info'
}

const getScoreClass = (score) => {
  if (score >= 9) return 'score-excellent'
  if (score >= 8) return 'score-good'
  if (score >= 7) return 'score-fair'
  return 'score-poor'
}

const getSupplierStatusType = (status) => {
  const types = {
    qualified: 'success',
    pending: 'warning',
    unqualified: 'danger',
    suspended: 'info'
  }
  return types[status] || 'info'
}

const getSupplierStatusText = (status) => {
  const texts = {
    qualified: '合格',
    pending: '待审核',
    unqualified: '不合格',
    suspended: '暂停'
  }
  return texts[status] || status
}

const getAuditStatusType = (status) => {
  const types = {
    planned: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getAuditStatusText = (status) => {
  const texts = {
    planned: '计划中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

const getAuditResultType = (result) => {
  const types = {
    '通过': 'success',
    '有条件通过': 'warning',
    '不通过': 'danger'
  }
  return types[result] || 'info'
}

const getImprovementStatusType = (status) => {
  const types = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getImprovementStatusText = (status) => {
  const texts = {
    planned: '计划中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

onMounted(() => {
  console.log('供应商质量管理页面已加载')
})
</script>

<style lang="scss" scoped>
.supplier-quality {
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

  .stats-overview {
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
          
          &.suppliers {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.qualified {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          &.audits {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.score {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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
  }

  .tabs-card {
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

  .search-bar {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
  }

  .score-excellent {
    color: #67c23a;
    font-weight: 600;
  }

  .score-good {
    color: #409eff;
    font-weight: 600;
  }

  .score-fair {
    color: #e6a23c;
    font-weight: 600;
  }

  .score-poor {
    color: #f56c6c;
    font-weight: 600;
  }

  .assessment-criteria {
    margin: 20px 0;
    
    h4 {
      margin-bottom: 16px;
      color: #303133;
    }
    
    .criterion-item {
      margin-bottom: 24px;
      padding: 16px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      background-color: #fafafa;
      
      .criterion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .criterion-name {
          font-weight: 600;
          color: #303133;
        }
        
        .criterion-weight {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .assessment-result {
    .result-content {
      .total-score {
        text-align: center;
        margin-bottom: 24px;
        
        .score-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }
        
        .score-value {
          font-size: 48px;
          font-weight: 600;
          line-height: 1;
        }
      }
      
      .score-breakdown {
        margin-bottom: 24px;
        
        .breakdown-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 12px;
        }
        
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #ebeef5;
          
          &:last-child {
            border-bottom: none;
          }
          
          .item-name {
            color: #606266;
            font-size: 14px;
          }
          
          .item-score {
            font-weight: 600;
            color: #303133;
          }
        }
      }
      
      .quality-level {
        text-align: center;
        
        .level-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }
      }
    }
  }

  .history-assessments {
    .history-content {
      .history-score {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .history-level {
        color: #606266;
        margin-bottom: 4px;
      }
      
      .history-assessor {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
