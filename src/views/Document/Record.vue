<template>
  <div class="record-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>质量记录管理</h2>
      <p>管理质量管理体系中的各类质量记录，确保记录的完整性和可追溯性</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon primary">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalRecords }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.validRecords }}</div>
              <div class="stat-label">有效记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.expiringSoon }}</div>
              <div class="stat-label">即将过期</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.expiredRecords }}</div>
              <div class="stat-label">已过期</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" :inline="true">
          <el-form-item label="记录编号">
            <el-input v-model="searchForm.recordNo" placeholder="请输入记录编号" clearable />
          </el-form-item>
          <el-form-item label="记录类型">
            <el-select v-model="searchForm.type" placeholder="请选择记录类型" clearable>
              <el-option label="检验记录" value="inspection" />
              <el-option label="审核记录" value="audit" />
              <el-option label="培训记录" value="training" />
              <el-option label="校准记录" value="calibration" />
              <el-option label="维护记录" value="maintenance" />
              <el-option label="不合格记录" value="nonconforming" />
              <el-option label="纠正措施记录" value="corrective" />
              <el-option label="预防措施记录" value="preventive" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="有效" value="valid" />
              <el-option label="即将过期" value="expiring" />
              <el-option label="已过期" value="expired" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
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
              查询
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="action-bar">
        <div class="action-left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增记录
          </el-button>
          <el-button @click="handleBatchArchive" :disabled="!selectedRecords.length">
            <el-icon><FolderOpened /></el-icon>
            批量归档
          </el-button>
          <el-button @click="handleExport" :loading="exporting">
            <el-icon><Download /></el-icon>
            导出记录
          </el-button>
        </div>
        <div class="action-right">
          <el-button-group>
            <el-button :type="viewMode === 'table' ? 'primary' : ''" @click="viewMode = 'table'">
              <el-icon><List /></el-icon>
            </el-button>
            <el-button :type="viewMode === 'card' ? 'primary' : ''" @click="viewMode = 'card'">
              <el-icon><Grid /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </el-card>

    <!-- 记录列表 - 表格视图 -->
    <el-card v-if="viewMode === 'table'" class="table-card">
      <el-table
        :data="recordList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="recordNo" label="记录编号" width="150" />
        <el-table-column prop="title" label="记录标题" min-width="200" />
        <el-table-column prop="type" label="记录类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="所属部门" width="120" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="retentionPeriod" label="保存期限" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="primary" link @click="handleDownload(row)">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, row)">
              <el-button type="primary" link>
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="archive">归档</el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
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

    <!-- 记录列表 - 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <el-row :gutter="20">
        <el-col :span="8" v-for="record in recordList" :key="record.id">
          <el-card class="record-card" :class="{ selected: selectedRecords.includes(record.id) }">
            <div class="record-header">
              <div class="record-title">{{ record.title }}</div>
              <el-checkbox
                :model-value="selectedRecords.includes(record.id)"
                @change="(checked) => handleCardSelect(record.id, checked)"
              />
            </div>
            <div class="record-info">
              <div class="info-item">
                <span class="label">记录编号：</span>
                <span class="value">{{ record.recordNo }}</span>
              </div>
              <div class="info-item">
                <span class="label">记录类型：</span>
                <el-tag :type="getTypeTag(record.type)" size="small">
                  {{ getTypeName(record.type) }}
                </el-tag>
              </div>
              <div class="info-item">
                <span class="label">所属部门：</span>
                <span class="value">{{ record.department }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建人：</span>
                <span class="value">{{ record.creator }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ record.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态：</span>
                <el-tag :type="getStatusTag(record.status)" size="small">
                  {{ getStatusName(record.status) }}
                </el-tag>
              </div>
            </div>
            <div class="record-actions">
              <el-button type="primary" size="small" @click="handleView(record)">查看</el-button>
              <el-button size="small" @click="handleEdit(record)">编辑</el-button>
              <el-button size="small" @click="handleDownload(record)">下载</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[9, 18, 36, 72]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑记录对话框 -->
    <el-dialog
      v-model="recordDialog.visible"
      :title="recordDialog.isEdit ? '编辑记录' : '新增记录'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="recordFormRef"
        :model="recordDialog.form"
        :rules="recordRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="记录编号" prop="recordNo">
              <el-input v-model="recordDialog.form.recordNo" placeholder="请输入记录编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="记录类型" prop="type">
              <el-select v-model="recordDialog.form.type" placeholder="请选择记录类型">
                <el-option label="检验记录" value="inspection" />
                <el-option label="审核记录" value="audit" />
                <el-option label="培训记录" value="training" />
                <el-option label="校准记录" value="calibration" />
                <el-option label="维护记录" value="maintenance" />
                <el-option label="不合格记录" value="nonconforming" />
                <el-option label="纠正措施记录" value="corrective" />
                <el-option label="预防措施记录" value="preventive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="记录标题" prop="title">
          <el-input v-model="recordDialog.form.title" placeholder="请输入记录标题" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属部门" prop="department">
              <el-select v-model="recordDialog.form.department" placeholder="请选择所属部门">
                <el-option label="质量部" value="quality" />
                <el-option label="生产部" value="production" />
                <el-option label="技术部" value="technical" />
                <el-option label="采购部" value="procurement" />
                <el-option label="销售部" value="sales" />
                <el-option label="人事部" value="hr" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保存期限" prop="retentionPeriod">
              <el-select v-model="recordDialog.form.retentionPeriod" placeholder="请选择保存期限">
                <el-option label="1年" value="1年" />
                <el-option label="3年" value="3年" />
                <el-option label="5年" value="5年" />
                <el-option label="10年" value="10年" />
                <el-option label="永久" value="永久" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="记录描述">
          <el-input
            v-model="recordDialog.form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入记录描述"
          />
        </el-form-item>

        <el-form-item label="附件上传">
          <el-upload
            v-model:file-list="recordDialog.form.attachments"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            multiple
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word、Excel、图片等格式，单个文件不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input v-model="recordDialog.form.keywords" placeholder="请输入关键词，多个关键词用逗号分隔" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="recordDialog.form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            {{ recordDialog.isEdit ? '更新' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 记录详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="记录详情" width="900px">
      <div class="record-detail" v-if="detailDialog.data">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录编号">{{ detailDialog.data.recordNo }}</el-descriptions-item>
          <el-descriptions-item label="记录类型">
            <el-tag :type="getTypeTag(detailDialog.data.type)" size="small">
              {{ getTypeName(detailDialog.data.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="记录标题" :span="2">{{ detailDialog.data.title }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ detailDialog.data.department }}</el-descriptions-item>
          <el-descriptions-item label="保存期限">{{ detailDialog.data.retentionPeriod }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ detailDialog.data.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailDialog.data.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后修改人">{{ detailDialog.data.lastModifier }}</el-descriptions-item>
          <el-descriptions-item label="最后修改时间">{{ detailDialog.data.lastModifyTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(detailDialog.data.status)" size="small">
              {{ getStatusName(detailDialog.data.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="关键词">{{ detailDialog.data.keywords }}</el-descriptions-item>
          <el-descriptions-item label="记录描述" :span="2">{{ detailDialog.data.description }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailDialog.data.remarks }}</el-descriptions-item>
        </el-descriptions>

        <!-- 附件列表 -->
        <div class="attachment-section" v-if="detailDialog.data.attachments?.length">
          <h4>附件列表</h4>
          <el-table :data="detailDialog.data.attachments" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="文件大小" width="120" />
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link @click="downloadAttachment(row)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  CircleCheckFilled,
  WarningFilled,
  CircleCloseFilled,
  Search,
  Plus,
  FolderOpened,
  Download,
  List,
  Grid,
  View,
  Edit,
  ArrowDown,
  UploadFilled
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const exporting = ref(false)
const viewMode = ref('table')
const selectedRecords = ref([])

// 统计数据
const stats = reactive({
  totalRecords: 1248,
  validRecords: 1156,
  expiringSoon: 67,
  expiredRecords: 25
})

// 搜索表单
const searchForm = reactive({
  recordNo: '',
  type: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 记录列表
const recordList = ref([
  {
    id: 1,
    recordNo: 'QR-2024-001',
    title: '产品A入厂检验记录',
    type: 'inspection',
    department: '质量部',
    creator: '张三',
    createTime: '2024-01-07 09:00:00',
    lastModifier: '李四',
    lastModifyTime: '2024-01-07 10:30:00',
    retentionPeriod: '5年',
    status: 'valid',
    description: '产品A的入厂检验记录，包含外观检查、尺寸测量、性能测试等内容',
    keywords: '产品A,入厂检验,质量控制',
    remarks: '检验合格，符合技术要求',
    attachments: [
      { name: '检验报告.pdf', size: '2.5MB', uploadTime: '2024-01-07 09:15:00' },
      { name: '检验照片.jpg', size: '1.2MB', uploadTime: '2024-01-07 09:20:00' }
    ]
  },
  {
    id: 2,
    recordNo: 'QR-2024-002',
    title: 'ISO9001内部审核记录',
    type: 'audit',
    department: '质量部',
    creator: '王五',
    createTime: '2024-01-06 14:00:00',
    lastModifier: '王五',
    lastModifyTime: '2024-01-06 16:30:00',
    retentionPeriod: '3年',
    status: 'valid',
    description: 'ISO9001质量管理体系内部审核记录',
    keywords: 'ISO9001,内部审核,质量管理体系',
    remarks: '审核发现3个不符合项，已制定纠正措施',
    attachments: [
      { name: '审核报告.docx', size: '1.8MB', uploadTime: '2024-01-06 16:00:00' }
    ]
  }
])

// 记录对话框
const recordDialog = reactive({
  visible: false,
  isEdit: false,
  form: {
    recordNo: '',
    title: '',
    type: '',
    department: '',
    retentionPeriod: '',
    description: '',
    keywords: '',
    remarks: '',
    attachments: []
  }
})

// 详情对话框
const detailDialog = reactive({
  visible: false,
  data: null
})

// 表单引用
const recordFormRef = ref()

// 表单验证规则
const recordRules = {
  recordNo: [
    { required: true, message: '请输入记录编号', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入记录标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择记录类型', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  retentionPeriod: [
    { required: true, message: '请选择保存期限', trigger: 'change' }
  ]
}

// 上传配置
const uploadUrl = '/api/upload'
const uploadHeaders = {
  'Authorization': 'Bearer token'
}

// 方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 1000)
}

const resetSearch = () => {
  Object.assign(searchForm, {
    recordNo: '',
    type: '',
    status: '',
    dateRange: []
  })
}

const handleAdd = () => {
  recordDialog.isEdit = false
  recordDialog.form = {
    recordNo: '',
    title: '',
    type: '',
    department: '',
    retentionPeriod: '',
    description: '',
    keywords: '',
    remarks: '',
    attachments: []
  }
  recordDialog.visible = true
}

const handleEdit = (row) => {
  recordDialog.isEdit = true
  recordDialog.form = { ...row }
  recordDialog.visible = true
}

const handleView = (row) => {
  detailDialog.data = row
  detailDialog.visible = true
}

const handleDownload = (row) => {
  ElMessage.success(`正在下载记录：${row.title}`)
}

const handleBatchArchive = () => {
  ElMessageBox.confirm(
    `确定要归档选中的 ${selectedRecords.value.length} 条记录吗？`,
    '批量归档确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('记录归档成功')
    selectedRecords.value = []
  })
}

const handleExport = () => {
  exporting.value = true
  setTimeout(() => {
    exporting.value = false
    ElMessage.success('记录导出成功')
  }, 2000)
}

const handleMoreAction = (command, row) => {
  switch (command) {
    case 'archive':
      ElMessage.success(`记录 ${row.title} 已归档`)
      break
    case 'copy':
      ElMessage.success(`记录 ${row.title} 已复制`)
      break
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除记录 "${row.title}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('记录删除成功')
      })
      break
  }
}

const handleSelectionChange = (selection) => {
  selectedRecords.value = selection.map(item => item.id)
}

const handleCardSelect = (id, checked) => {
  if (checked) {
    selectedRecords.value.push(id)
  } else {
    const index = selectedRecords.value.indexOf(id)
    if (index > -1) {
      selectedRecords.value.splice(index, 1)
    }
  }
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

const handleSave = () => {
  recordFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        recordDialog.visible = false
        ElMessage.success(recordDialog.isEdit ? '记录更新成功' : '记录创建成功')
      }, 1000)
    }
  })
}

const handleDialogClose = () => {
  recordFormRef.value?.resetFields()
}

const handleUploadSuccess = (response, file) => {
  ElMessage.success(`文件 ${file.name} 上传成功`)
}

const handleUploadError = (error, file) => {
  ElMessage.error(`文件 ${file.name} 上传失败`)
}

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
  }
  return isLt10M
}

const downloadAttachment = (attachment) => {
  ElMessage.success(`正在下载文件：${attachment.name}`)
}

const getTypeTag = (type) => {
  const tags = {
    inspection: 'primary',
    audit: 'success',
    training: 'info',
    calibration: 'warning',
    maintenance: 'danger',
    nonconforming: 'danger',
    corrective: 'warning',
    preventive: 'info'
  }
  return tags[type] || 'info'
}

const getTypeName = (type) => {
  const names = {
    inspection: '检验记录',
    audit: '审核记录',
    training: '培训记录',
    calibration: '校准记录',
    maintenance: '维护记录',
    nonconforming: '不合格记录',
    corrective: '纠正措施记录',
    preventive: '预防措施记录'
  }
  return names[type] || type
}

const getStatusTag = (status) => {
  const tags = {
    valid: 'success',
    expiring: 'warning',
    expired: 'danger',
    archived: 'info'
  }
  return tags[status] || 'info'
}

const getStatusName = (status) => {
  const names = {
    valid: '有效',
    expiring: '即将过期',
    expired: '已过期',
    archived: '已归档'
  }
  return names[status] || status
}

// 生命周期
onMounted(() => {
  pagination.total = recordList.value.length
})
</script>

<style lang="scss" scoped>
.record-management {
  padding: 20px;

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

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        padding: 20px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 28px;
          color: white;

          &.primary {
            background: #409eff;
          }

          &.success {
            background: #67c23a;
          }

          &.warning {
            background: #e6a23c;
          }

          &.danger {
            background: #f56c6c;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 32px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .search-card {
    margin-bottom: 20px;

    .search-form {
      margin-bottom: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .action-left {
        display: flex;
        gap: 12px;
      }
    }
  }

  .table-card {
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .card-view {
    .record-card {
      margin-bottom: 20px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.selected {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .record-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .record-info {
        margin-bottom: 16px;

        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            font-size: 14px;
            color: #909399;
            margin-right: 8px;
            min-width: 80px;
          }

          .value {
            font-size: 14px;
            color: #303133;
          }
        }
      }

      .record-actions {
        display: flex;
        gap: 8px;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .record-detail {
    .attachment-section {
      margin-top: 20px;

      h4 {
        margin: 0 0 16px 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

@media (max-width: 768px) {
  .record-management {
    padding: 16px;

    .stats-row {
      .stat-card {
        margin-bottom: 16px;

        .stat-content {
          padding: 16px;

          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .stat-info {
            .stat-value {
              font-size: 28px;
            }
          }
        }
      }
    }

    .search-card {
      .search-form {
        padding: 16px;

        .el-form {
          .el-form-item {
            display: block;
            margin-bottom: 16px;

            .el-form-item__content {
              margin-left: 0 !important;
            }
          }
        }
      }

      .action-bar {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;

        .action-left {
          justify-content: center;
        }

        .action-right {
          display: flex;
          justify-content: center;
        }
      }
    }

    .card-view {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
