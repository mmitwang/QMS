<template>
  <div class="standard-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Document /></el-icon>
          质量标准管理
        </h1>
        <p class="page-description">管理企业质量标准文档，包括国际标准、行业标准和企业标准</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增标准
        </el-button>
        <el-button @click="exportStandards">
          <el-icon><Download /></el-icon>
          导出标准
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">标准总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.active }}</div>
              <div class="stat-label">有效标准</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon expired">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.expired }}</div>
              <div class="stat-label">过期标准</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon draft">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.draft }}</div>
              <div class="stat-label">草稿标准</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-card>
        <el-form :model="searchForm" inline>
          <el-form-item label="标准编号">
            <el-input v-model="searchForm.code" placeholder="请输入标准编号" clearable />
          </el-form-item>
          <el-form-item label="标准名称">
            <el-input v-model="searchForm.name" placeholder="请输入标准名称" clearable />
          </el-form-item>
          <el-form-item label="标准类型">
            <el-select v-model="searchForm.type" placeholder="请选择标准类型" clearable>
              <el-option label="国际标准" value="international" />
              <el-option label="国家标准" value="national" />
              <el-option label="行业标准" value="industry" />
              <el-option label="企业标准" value="enterprise" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="有效" value="active" />
              <el-option label="过期" value="expired" />
              <el-option label="草稿" value="draft" />
              <el-option label="废止" value="abolished" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchStandards">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 标准列表 -->
    <div class="table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>质量标准列表</span>
            <div class="table-actions">
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
        </template>

        <!-- 表格视图 -->
        <el-table v-if="viewMode === 'table'" :data="standardList" stripe>
          <el-table-column prop="code" label="标准编号" width="150" />
          <el-table-column prop="name" label="标准名称" min-width="200" />
          <el-table-column prop="type" label="标准类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column prop="expiryDate" label="失效日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewStandard(row)">查看</el-button>
              <el-button size="small" type="primary" @click="editStandard(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteStandard(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 卡片视图 -->
        <div v-else class="card-view">
          <el-row :gutter="20">
            <el-col :span="8" v-for="standard in standardList" :key="standard.id">
              <div class="standard-card">
                <div class="card-header">
                  <div class="card-title">{{ standard.name }}</div>
                  <el-tag :type="getStatusTagType(standard.status)" size="small">
                    {{ getStatusLabel(standard.status) }}
                  </el-tag>
                </div>
                <div class="card-content">
                  <div class="card-info">
                    <div class="info-item">
                      <span class="label">标准编号：</span>
                      <span class="value">{{ standard.code }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">标准类型：</span>
                      <el-tag :type="getTypeTagType(standard.type)" size="small">
                        {{ getTypeLabel(standard.type) }}
                      </el-tag>
                    </div>
                    <div class="info-item">
                      <span class="label">版本：</span>
                      <span class="value">{{ standard.version }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">生效日期：</span>
                      <span class="value">{{ standard.effectiveDate }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button size="small" @click="viewStandard(standard)">查看</el-button>
                  <el-button size="small" type="primary" @click="editStandard(standard)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteStandard(standard)">删除</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

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
    </div>

    <!-- 新增/编辑标准对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingStandard ? '编辑标准' : '新增标准'"
      width="800px"
      @close="resetForm"
    >
      <el-form :model="standardForm" :rules="formRules" ref="standardFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准编号" prop="code">
              <el-input v-model="standardForm.code" placeholder="请输入标准编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标准名称" prop="name">
              <el-input v-model="standardForm.name" placeholder="请输入标准名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准类型" prop="type">
              <el-select v-model="standardForm.type" placeholder="请选择标准类型">
                <el-option label="国际标准" value="international" />
                <el-option label="国家标准" value="national" />
                <el-option label="行业标准" value="industry" />
                <el-option label="企业标准" value="enterprise" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本" prop="version">
              <el-input v-model="standardForm.version" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="standardForm.effectiveDate"
                type="date"
                placeholder="请选择生效日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失效日期" prop="expiryDate">
              <el-date-picker
                v-model="standardForm.expiryDate"
                type="date"
                placeholder="请选择失效日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标准描述" prop="description">
          <el-input
            v-model="standardForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入标准描述"
          />
        </el-form-item>
        <el-form-item label="适用范围" prop="scope">
          <el-input
            v-model="standardForm.scope"
            type="textarea"
            :rows="3"
            placeholder="请输入适用范围"
          />
        </el-form-item>
        <el-form-item label="关键要求" prop="requirements">
          <el-input
            v-model="standardForm.requirements"
            type="textarea"
            :rows="4"
            placeholder="请输入关键要求"
          />
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            multiple
            :file-list="standardForm.attachments"
            :before-upload="beforeUpload"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、DOC、DOCX 格式文件，且不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveStandard">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 标准详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="标准详情" width="900px">
      <div v-if="selectedStandard" class="standard-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标准编号">{{ selectedStandard.code }}</el-descriptions-item>
          <el-descriptions-item label="标准名称">{{ selectedStandard.name }}</el-descriptions-item>
          <el-descriptions-item label="标准类型">
            <el-tag :type="getTypeTagType(selectedStandard.type)">
              {{ getTypeLabel(selectedStandard.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="版本">{{ selectedStandard.version }}</el-descriptions-item>
          <el-descriptions-item label="生效日期">{{ selectedStandard.effectiveDate }}</el-descriptions-item>
          <el-descriptions-item label="失效日期">{{ selectedStandard.expiryDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedStandard.status)">
              {{ getStatusLabel(selectedStandard.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedStandard.createTime }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section">
          <h4>标准描述</h4>
          <p>{{ selectedStandard.description }}</p>
        </div>
        
        <div class="detail-section">
          <h4>适用范围</h4>
          <p>{{ selectedStandard.scope }}</p>
        </div>
        
        <div class="detail-section">
          <h4>关键要求</h4>
          <p>{{ selectedStandard.requirements }}</p>
        </div>
        
        <div class="detail-section" v-if="selectedStandard.attachments && selectedStandard.attachments.length">
          <h4>相关附件</h4>
          <div class="attachment-list">
            <div v-for="file in selectedStandard.attachments" :key="file.id" class="attachment-item">
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
              <el-button size="small" type="primary" link @click="downloadFile(file)">下载</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'QualityStandard',
  setup() {
    // 响应式数据
    const viewMode = ref('table')
    const showAddDialog = ref(false)
    const showDetailDialog = ref(false)
    const editingStandard = ref(null)
    const selectedStandard = ref(null)
    const standardFormRef = ref(null)

    // 统计数据
    const statistics = reactive({
      total: 156,
      active: 142,
      expired: 8,
      draft: 6
    })

    // 搜索表单
    const searchForm = reactive({
      code: '',
      name: '',
      type: '',
      status: ''
    })

    // 标准表单
    const standardForm = reactive({
      code: '',
      name: '',
      type: '',
      version: '',
      effectiveDate: '',
      expiryDate: '',
      description: '',
      scope: '',
      requirements: '',
      attachments: []
    })

    // 表单验证规则
    const formRules = {
      code: [
        { required: true, message: '请输入标准编号', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入标准名称', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择标准类型', trigger: 'change' }
      ],
      version: [
        { required: true, message: '请输入版本号', trigger: 'blur' }
      ],
      effectiveDate: [
        { required: true, message: '请选择生效日期', trigger: 'change' }
      ]
    }

    // 分页数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 156
    })

    // 标准列表数据
    const standardList = ref([
      {
        id: 1,
        code: 'ISO-9001-2015',
        name: 'ISO 9001:2015 质量管理体系要求',
        type: 'international',
        version: '2015',
        effectiveDate: '2015-09-15',
        expiryDate: '2025-09-15',
        status: 'active',
        description: 'ISO 9001:2015规定了质量管理体系的要求，适用于任何组织，无论其类型、规模和所提供的产品和服务。',
        scope: '适用于所有类型和规模的组织，包括制造业、服务业等各个行业。',
        requirements: '建立、实施、保持和持续改进质量管理体系；确定组织环境；识别相关方需求和期望；建立质量方针和目标等。',
        createTime: '2023-01-15 10:30:00',
        attachments: [
          { id: 1, name: 'ISO9001-2015标准文件.pdf' },
          { id: 2, name: '实施指南.docx' }
        ]
      },
      {
        id: 2,
        code: 'GB/T-19001-2016',
        name: 'GB/T 19001-2016 质量管理体系要求',
        type: 'national',
        version: '2016',
        effectiveDate: '2017-07-01',
        expiryDate: '2027-07-01',
        status: 'active',
        description: '等同采用ISO 9001:2015的国家标准，规定了质量管理体系的要求。',
        scope: '适用于中国境内所有类型和规模的组织。',
        requirements: '与ISO 9001:2015要求一致，符合中国国情和法规要求。',
        createTime: '2023-02-20 14:20:00',
        attachments: []
      },
      {
        id: 3,
        code: 'QMS-STD-001',
        name: '产品质量检验标准',
        type: 'enterprise',
        version: '1.2',
        effectiveDate: '2023-01-01',
        expiryDate: '2024-12-31',
        status: 'active',
        description: '企业内部产品质量检验的标准化要求和操作规程。',
        scope: '适用于公司所有产品的质量检验活动。',
        requirements: '明确检验项目、检验方法、判定标准和记录要求。',
        createTime: '2023-01-01 09:00:00',
        attachments: [
          { id: 3, name: '检验标准操作手册.pdf' }
        ]
      }
    ])

    // 方法
    const searchStandards = () => {
      // 实际项目中这里会调用API
      ElMessage.success('搜索完成')
    }

    const resetSearch = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
      })
      searchStandards()
    }

    const viewStandard = (standard) => {
      selectedStandard.value = standard
      showDetailDialog.value = true
    }

    const editStandard = (standard) => {
      editingStandard.value = standard
      Object.keys(standardForm).forEach(key => {
        if (standard[key] !== undefined) {
          standardForm[key] = standard[key]
        }
      })
      showAddDialog.value = true
    }

    const deleteStandard = (standard) => {
      ElMessageBox.confirm(
        `确定要删除标准"${standard.name}"吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 实际项目中这里会调用删除API
        ElMessage.success('删除成功')
      })
    }

    const saveStandard = () => {
      standardFormRef.value.validate((valid) => {
        if (valid) {
          // 实际项目中这里会调用保存API
          ElMessage.success(editingStandard.value ? '更新成功' : '创建成功')
          showAddDialog.value = false
          resetForm()
        }
      })
    }

    const resetForm = () => {
      editingStandard.value = null
      Object.keys(standardForm).forEach(key => {
        if (Array.isArray(standardForm[key])) {
          standardForm[key] = []
        } else {
          standardForm[key] = ''
        }
      })
      if (standardFormRef.value) {
        standardFormRef.value.resetFields()
      }
    }

    const exportStandards = () => {
      ElMessage.success('导出成功')
    }

    const beforeUpload = (file) => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isValidType) {
        ElMessage.error('只能上传 PDF、DOC、DOCX 格式的文件!')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('文件大小不能超过 10MB!')
        return false
      }
      return true
    }

    const downloadFile = (file) => {
      ElMessage.success(`下载文件: ${file.name}`)
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      // 重新加载数据
    }

    const handleCurrentChange = (page) => {
      pagination.currentPage = page
      // 重新加载数据
    }

    // 辅助方法
    const getTypeLabel = (type) => {
      const labels = {
        international: '国际标准',
        national: '国家标准',
        industry: '行业标准',
        enterprise: '企业标准'
      }
      return labels[type] || type
    }

    const getTypeTagType = (type) => {
      const types = {
        international: 'danger',
        national: 'warning',
        industry: 'info',
        enterprise: 'success'
      }
      return types[type] || ''
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: '有效',
        expired: '过期',
        draft: '草稿',
        abolished: '废止'
      }
      return labels[status] || status
    }

    const getStatusTagType = (status) => {
      const types = {
        active: 'success',
        expired: 'danger',
        draft: 'info',
        abolished: 'warning'
      }
      return types[status] || ''
    }

    onMounted(() => {
      // 初始化数据
    })

    return {
      viewMode,
      showAddDialog,
      showDetailDialog,
      editingStandard,
      selectedStandard,
      standardFormRef,
      statistics,
      searchForm,
      standardForm,
      formRules,
      pagination,
      standardList,
      searchStandards,
      resetSearch,
      viewStandard,
      editStandard,
      deleteStandard,
      saveStandard,
      resetForm,
      exportStandards,
      beforeUpload,
      downloadFile,
      handleSizeChange,
      handleCurrentChange,
      getTypeLabel,
      getTypeTagType,
      getStatusLabel,
      getStatusTagType
    }
  }
}
</script>

<style lang="scss" scoped>
.standard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-description {
      color: #606266;
      margin: 0;
      font-size: 14px;
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
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;

      &.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.active { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
      &.expired { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.draft { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    }

    .stat-content {
      .stat-number {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

.search-section {
  margin-bottom: 20px;
}

.table-section {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.card-view {
  .standard-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .card-title {
        font-weight: 600;
        color: #303133;
        font-size: 16px;
        line-height: 1.4;
      }
    }

    .card-content {
      .card-info {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .label {
            color: #909399;
            font-size: 14px;
          }

          .value {
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }

    .card-actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.standard-detail {
  .detail-section {
    margin-top: 20px;

    h4 {
      color: #303133;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      border-left: 4px solid #409eff;
      padding-left: 12px;
    }

    p {
      color: #606266;
      line-height: 1.6;
      margin: 0;
    }
  }

  .attachment-list {
    .attachment-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 8px;

      .el-icon {
        color: #409eff;
      }

      span {
        flex: 1;
        color: #303133;
      }
    }
  }
}

.upload-demo {
  width: 100%;
}
</style>
