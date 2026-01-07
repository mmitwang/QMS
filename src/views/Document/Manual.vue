<template>
  <div class="manual-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>质量手册管理</h2>
      <p>管理企业质量手册文档，包括手册的创建、编辑、审核、发布和版本控制</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.total }}</div>
                <div class="stats-label">手册总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon published">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.published }}</div>
                <div class="stats-label">已发布</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon draft">
                <el-icon><Edit /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.draft }}</div>
                <div class="stats-label">草稿</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon review">
                <el-icon><View /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.review }}</div>
                <div class="stats-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <div class="left-operations">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新建手册
        </el-button>
        <el-button @click="handleBatchPublish" :disabled="selectedManuals.length === 0">
          <el-icon><Upload /></el-icon>
          批量发布
        </el-button>
        <el-button @click="handleBatchArchive" :disabled="selectedManuals.length === 0">
          <el-icon><FolderOpened /></el-icon>
          批量归档
        </el-button>
      </div>
      <div class="right-operations">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索手册名称、编号"
          style="width: 200px; margin-right: 10px;"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px; margin-right: 10px;" clearable>
          <el-option label="草稿" value="draft" />
          <el-option label="待审核" value="review" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-select v-model="searchForm.category" placeholder="分类" style="width: 120px; margin-right: 10px;" clearable>
          <el-option label="质量手册" value="quality" />
          <el-option label="程序文件" value="procedure" />
          <el-option label="作业指导书" value="instruction" />
          <el-option label="管理制度" value="regulation" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </div>

    <!-- 手册列表 -->
    <el-card class="table-card">
      <el-table
        :data="manualList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="手册编号" width="120" />
        <el-table-column prop="name" label="手册名称" min-width="200">
          <template #default="{ row }">
            <el-link @click="showDetailDialog(row)" type="primary">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="编制人" width="100" />
        <el-table-column prop="reviewer" label="审核人" width="100" />
        <el-table-column prop="approver" label="批准人" width="100" />
        <el-table-column prop="publishDate" label="发布日期" width="120" />
        <el-table-column prop="effectiveDate" label="生效日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">编辑</el-button>
            <el-button size="small" @click="showVersionDialog(row)">版本</el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="preview">预览</el-dropdown-item>
                  <el-dropdown-item command="download">下载</el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="publish" v-if="row.status === 'draft' || row.status === 'review'">发布</el-dropdown-item>
                  <el-dropdown-item command="archive" v-if="row.status === 'published'">归档</el-dropdown-item>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
      :before-close="handleDialogClose"
    >
      <el-form :model="manualForm" :rules="manualRules" ref="manualFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手册编号" prop="code">
              <el-input v-model="manualForm.code" placeholder="请输入手册编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手册名称" prop="name">
              <el-input v-model="manualForm.name" placeholder="请输入手册名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="manualForm.category" placeholder="请选择分类" style="width: 100%">
                <el-option label="质量手册" value="quality" />
                <el-option label="程序文件" value="procedure" />
                <el-option label="作业指导书" value="instruction" />
                <el-option label="管理制度" value="regulation" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="manualForm.version" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编制人" prop="author">
              <el-select v-model="manualForm.author" placeholder="请选择编制人" style="width: 100%">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核人" prop="reviewer">
              <el-select v-model="manualForm.reviewer" placeholder="请选择审核人" style="width: 100%">
                <el-option label="赵六" value="赵六" />
                <el-option label="钱七" value="钱七" />
                <el-option label="孙八" value="孙八" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批准人" prop="approver">
              <el-select v-model="manualForm.approver" placeholder="请选择批准人" style="width: 100%">
                <el-option label="周九" value="周九" />
                <el-option label="吴十" value="吴十" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="manualForm.effectiveDate"
                type="date"
                placeholder="请选择生效日期"
                style="width: 100%"
              />
            </el-date-picker>
          </el-col>
        </el-row>
        <el-form-item label="手册描述" prop="description">
          <el-input
            v-model="manualForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入手册描述"
          />
        </el-form-item>
        <el-form-item label="手册内容" prop="content">
          <el-input
            v-model="manualForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入手册内容"
          />
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            multiple
            :file-list="manualForm.attachments"
            :before-upload="beforeUpload"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 doc/docx/pdf/txt 格式文件，且不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button type="success" @click="handleSaveAndSubmit">保存并提交审核</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 手册详情对话框 -->
    <el-dialog title="手册详情" v-model="detailDialogVisible" width="900px">
      <div class="manual-detail" v-if="currentManual">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="手册编号">{{ currentManual.code }}</el-descriptions-item>
          <el-descriptions-item label="手册名称">{{ currentManual.name }}</el-descriptions-item>
          <el-descriptions-item label="分类">
            <el-tag :type="getCategoryType(currentManual.category)">
              {{ getCategoryLabel(currentManual.category) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="版本">{{ currentManual.version }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentManual.status)">
              {{ getStatusLabel(currentManual.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="编制人">{{ currentManual.author }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ currentManual.reviewer }}</el-descriptions-item>
          <el-descriptions-item label="批准人">{{ currentManual.approver }}</el-descriptions-item>
          <el-descriptions-item label="发布日期">{{ currentManual.publishDate }}</el-descriptions-item>
          <el-descriptions-item label="生效日期">{{ currentManual.effectiveDate }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentManual.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentManual.updateTime }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="manual-content" style="margin-top: 20px;">
          <h4>手册描述</h4>
          <p>{{ currentManual.description }}</p>
          
          <h4>手册内容</h4>
          <div class="content-preview">
            {{ currentManual.content }}
          </div>
          
          <h4 v-if="currentManual.attachments && currentManual.attachments.length > 0">附件列表</h4>
          <el-table :data="currentManual.attachments" v-if="currentManual.attachments && currentManual.attachments.length > 0">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="文件大小" />
            <el-table-column prop="uploadTime" label="上传时间" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button size="small" @click="downloadAttachment(row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 版本历史对话框 -->
    <el-dialog title="版本历史" v-model="versionDialogVisible" width="800px">
      <el-table :data="versionList" v-loading="versionLoading">
        <el-table-column prop="version" label="版本号" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="编制人" width="100" />
        <el-table-column prop="publishDate" label="发布日期" width="120" />
        <el-table-column prop="description" label="版本说明" min-width="200" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="previewVersion(row)">预览</el-button>
            <el-button size="small" @click="downloadVersion(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Check,
  Edit,
  View,
  Plus,
  Upload,
  FolderOpened,
  Search,
  ArrowDown,
  UploadFilled
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const versionLoading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const versionDialogVisible = ref(false)
const isEdit = ref(false)
const selectedManuals = ref([])
const currentManual = ref(null)
const manualFormRef = ref(null)

// 统计数据
const stats = reactive({
  total: 28,
  published: 15,
  draft: 8,
  review: 5
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  category: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 手册表单
const manualForm = reactive({
  id: null,
  code: '',
  name: '',
  category: '',
  version: '1.0',
  author: '',
  reviewer: '',
  approver: '',
  effectiveDate: '',
  description: '',
  content: '',
  attachments: []
})

// 表单验证规则
const manualRules = {
  code: [
    { required: true, message: '请输入手册编号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入手册名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请选择编制人', trigger: 'change' }
  ]
}

// 手册列表数据
const manualList = ref([
  {
    id: 1,
    code: 'QM-001',
    name: '质量管理体系手册',
    category: 'quality',
    version: '3.0',
    status: 'published',
    author: '张三',
    reviewer: '赵六',
    approver: '周九',
    publishDate: '2024-01-15',
    effectiveDate: '2024-02-01',
    description: '公司质量管理体系的总体要求和实施指南',
    content: '本手册规定了公司质量管理体系的总体要求...',
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-01-15 14:30:00',
    attachments: [
      { name: '质量手册附件.pdf', size: '2.5MB', uploadTime: '2024-01-10 09:30:00' }
    ]
  },
  {
    id: 2,
    code: 'QP-001',
    name: '文件控制程序',
    category: 'procedure',
    version: '2.1',
    status: 'published',
    author: '李四',
    reviewer: '钱七',
    approver: '吴十',
    publishDate: '2024-01-20',
    effectiveDate: '2024-02-05',
    description: '规定文件的编制、审核、批准、发布、更改和废止的控制要求',
    content: '本程序适用于公司质量管理体系文件的控制...',
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-20 16:00:00',
    attachments: []
  },
  {
    id: 3,
    code: 'WI-001',
    name: '产品检验作业指导书',
    category: 'instruction',
    version: '1.5',
    status: 'review',
    author: '王五',
    reviewer: '孙八',
    approver: '',
    publishDate: '',
    effectiveDate: '2024-02-10',
    description: '规定产品检验的具体操作步骤和要求',
    content: '本指导书适用于所有产品的检验作业...',
    createTime: '2024-01-18 11:00:00',
    updateTime: '2024-01-25 09:15:00',
    attachments: [
      { name: '检验标准.doc', size: '1.2MB', uploadTime: '2024-01-18 11:30:00' }
    ]
  },
  {
    id: 4,
    code: 'MR-001',
    name: '供应商管理制度',
    category: 'regulation',
    version: '1.0',
    status: 'draft',
    author: '赵六',
    reviewer: '',
    approver: '',
    publishDate: '',
    effectiveDate: '',
    description: '规定供应商的选择、评价、监控和管理要求',
    content: '为确保采购产品质量，特制定本制度...',
    createTime: '2024-01-22 14:00:00',
    updateTime: '2024-01-28 10:30:00',
    attachments: []
  }
])

// 版本历史数据
const versionList = ref([])

// 计算属性
const dialogTitle = computed(() => {
  return isEdit.value ? '编辑手册' : '新建手册'
})

// 获取分类标签
const getCategoryLabel = (category) => {
  const labels = {
    quality: '质量手册',
    procedure: '程序文件',
    instruction: '作业指导书',
    regulation: '管理制度'
  }
  return labels[category] || category
}

// 获取分类类型
const getCategoryType = (category) => {
  const types = {
    quality: 'danger',
    procedure: 'warning',
    instruction: 'success',
    regulation: 'info'
  }
  return types[category] || ''
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    draft: '草稿',
    review: '待审核',
    published: '已发布',
    archived: '已归档'
  }
  return labels[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    draft: 'info',
    review: 'warning',
    published: 'success',
    archived: 'danger'
  }
  return types[status] || ''
}

// 显示新增对话框
const showAddDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row) => {
  isEdit.value = true
  Object.assign(manualForm, { ...row })
  dialogVisible.value = true
}

// 显示详情对话框
const showDetailDialog = (row) => {
  currentManual.value = row
  detailDialogVisible.value = true
}

// 显示版本对话框
const showVersionDialog = (row) => {
  currentManual.value = row
  loadVersionHistory(row.id)
  versionDialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(manualForm, {
    id: null,
    code: '',
    name: '',
    category: '',
    version: '1.0',
    author: '',
    reviewer: '',
    approver: '',
    effectiveDate: '',
    description: '',
    content: '',
    attachments: []
  })
  if (manualFormRef.value) {
    manualFormRef.value.resetFields()
  }
}

// 处理对话框关闭
const handleDialogClose = (done) => {
  ElMessageBox.confirm('确认关闭？未保存的数据将丢失。')
    .then(() => {
      resetForm()
      done()
    })
    .catch(() => {})
}

// 保存手册
const handleSave = async () => {
  if (!manualFormRef.value) return
  
  try {
    await manualFormRef.value.validate()
    
    // 模拟保存操作
    if (isEdit.value) {
      const index = manualList.value.findIndex(item => item.id === manualForm.id)
      if (index !== -1) {
        manualList.value[index] = { ...manualForm }
      }
      ElMessage.success('手册更新成功')
    } else {
      const newManual = {
        ...manualForm,
        id: Date.now(),
        status: 'draft',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      manualList.value.unshift(newManual)
      ElMessage.success('手册创建成功')
    }
    
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 保存并提交审核
const handleSaveAndSubmit = async () => {
  if (!manualFormRef.value) return
  
  try {
    await manualFormRef.value.validate()
    
    // 模拟保存并提交操作
    if (isEdit.value) {
      const index = manualList.value.findIndex(item => item.id === manualForm.id)
      if (index !== -1) {
        manualList.value[index] = { ...manualForm, status: 'review' }
      }
      ElMessage.success('手册更新并提交审核成功')
    } else {
      const newManual = {
        ...manualForm,
        id: Date.now(),
        status: 'review',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      manualList.value.unshift(newManual)
      ElMessage.success('手册创建并提交审核成功')
    }
    
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 处理命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'preview':
      previewManual(row)
      break
    case 'download':
      downloadManual(row)
      break
    case 'copy':
      copyManual(row)
      break
    case 'publish':
      publishManual(row)
      break
    case 'archive':
      archiveManual(row)
      break
    case 'delete':
      deleteManual(row)
      break
  }
}

// 预览手册
const previewManual = (row) => {
  ElMessage.info('预览功能开发中...')
}

// 下载手册
const downloadManual = (row) => {
  ElMessage.success(`正在下载手册：${row.name}`)
}

// 复制手册
const copyManual = (row) => {
  const newManual = {
    ...row,
    id: Date.now(),
    code: row.code + '_copy',
    name: row.name + '_副本',
    status: 'draft',
    createTime: new Date().toLocaleString(),
    updateTime: new Date().toLocaleString()
  }
  manualList.value.unshift(newManual)
  ElMessage.success('手册复制成功')
}

// 发布手册
const publishManual = (row) => {
  ElMessageBox.confirm('确认发布此手册？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = manualList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      manualList.value[index].status = 'published'
      manualList.value[index].publishDate = new Date().toISOString().split('T')[0]
      manualList.value[index].updateTime = new Date().toLocaleString()
    }
    ElMessage.success('手册发布成功')
  }).catch(() => {})
}

// 归档手册
const archiveManual = (row) => {
  ElMessageBox.confirm('确认归档此手册？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = manualList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      manualList.value[index].status = 'archived'
      manualList.value[index].updateTime = new Date().toLocaleString()
    }
    ElMessage.success('手册归档成功')
  }).catch(() => {})
}

// 删除手册
const deleteManual = (row) => {
  ElMessageBox.confirm('确认删除此手册？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = manualList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      manualList.value.splice(index, 1)
    }
    ElMessage.success('手册删除成功')
  }).catch(() => {})
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedManuals.value = selection
}

// 批量发布
const handleBatchPublish = () => {
  if (selectedManuals.value.length === 0) {
    ElMessage.warning('请选择要发布的手册')
    return
  }
  
  ElMessageBox.confirm(`确认发布选中的 ${selectedManuals.value.length} 个手册？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedManuals.value.forEach(manual => {
      const index = manualList.value.findIndex(item => item.id === manual.id)
      if (index !== -1) {
        manualList.value[index].status = 'published'
        manualList.value[index].publishDate = new Date().toISOString().split('T')[0]
        manualList.value[index].updateTime = new Date().toLocaleString()
      }
    })
    ElMessage.success('批量发布成功')
    selectedManuals.value = []
  }).catch(() => {})
}

// 批量归档
const handleBatchArchive = () => {
  if (selectedManuals.value.length === 0) {
    ElMessage.warning('请选择要归档的手册')
    return
  }
  
  ElMessageBox.confirm(`确认归档选中的 ${selectedManuals.value.length} 个手册？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedManuals.value.forEach(manual => {
      const index = manualList.value.findIndex(item => item.id === manual.id)
      if (index !== -1) {
        manualList.value[index].status = 'archived'
        manualList.value[index].updateTime = new Date().toLocaleString()
      }
    })
    ElMessage.success('批量归档成功')
    selectedManuals.value = []
  }).catch(() => {})
}

// 搜索
const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: '',
    category: ''
  })
  ElMessage.success('搜索条件已重置')
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

// 加载版本历史
const loadVersionHistory = (manualId) => {
  versionLoading.value = true
  
  // 模拟加载版本历史数据
  setTimeout(() => {
    versionList.value = [
      {
        id: 1,
        version: '3.0',
        status: 'published',
        author: '张三',
        publishDate: '2024-01-15',
        description: '更新质量管理体系要求，增加风险管理章节'
      },
      {
        id: 2,
        version: '2.1',
        status: 'archived',
        author: '张三',
        publishDate: '2023-06-10',
        description: '修订检验流程，优化质量控制要求'
      },
      {
        id: 3,
        version: '2.0',
        status: 'archived',
        author: '李四',
        publishDate: '2023-01-20',
        description: '重大版本更新，全面修订质量管理体系'
      }
    ]
    versionLoading.value = false
  }, 1000)
}

// 预览版本
const previewVersion = (row) => {
  ElMessage.info(`预览版本 ${row.version}`)
}

// 下载版本
const downloadVersion = (row) => {
  ElMessage.success(`正在下载版本 ${row.version}`)
}

// 下载附件
const downloadAttachment = (attachment) => {
  ElMessage.success(`正在下载附件：${attachment.name}`)
}

// 文件上传前处理
const beforeUpload = (file) => {
  const isValidType = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/plain'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 doc/docx/pdf/txt 格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

// 组件挂载
onMounted(() => {
  pagination.total = manualList.value.length
})
</script>

<style lang="scss" scoped>
.manual-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 20px;
    
    h2 {
      color: #303133;
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    p {
      color: #606266;
      margin: 0;
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
          
          .el-icon {
            font-size: 24px;
            color: white;
          }
          
          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.published {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          &.draft {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.review {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }
        
        .stats-info {
          flex: 1;
          
          .stats-number {
            font-size: 28px;
            font-weight: 700;
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

  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .left-operations {
      display: flex;
      gap: 12px;
    }

    .right-operations {
      display: flex;
      align-items: center;
    }
  }

  .table-card {
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .manual-detail {
    .content-preview {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      border-left: 4px solid #409eff;
      margin-top: 8px;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }
    
    h4 {
      color: #303133;
      margin: 20px 0 10px 0;
      font-size: 16px;
      font-weight: 600;
      
      &:first-child {
        margin-top: 0;
      }
    }
  }
}

:deep(.el-table) {
  .el-table__header {
    th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 600;
    }
  }
}

:deep(.el-dialog) {
  .el-dialog__header {
    padding: 20px 20px 10px;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .el-dialog__body {
    padding: 10px 20px 20px;
  }
  
  .el-dialog__footer {
    padding: 10px 20px 20px;
  }
}

:deep(.el-form) {
  .el-form-item__label {
    font-weight: 600;
    color: #606266;
  }
}

:deep(.el-upload) {
  .el-upload-dragger {
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    width: 100%;
    height: 180px;
    text-align: center;
    color: #606266;
    position: relative;
    overflow: hidden;
    
    &:hover {
      border-color: #409eff;
    }
    
    .el-icon--upload {
      font-size: 67px;
      color: #c0c4cc;
      margin: 40px 0 16px;
      line-height: 50px;
    }
  }
}
</style>
