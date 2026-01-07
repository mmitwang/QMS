<template>
  <div class="procedure-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Files /></el-icon>
          作业程序管理
        </h1>
        <p class="page-description">管理质量管理体系中的作业程序文档，确保操作标准化</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增程序
        </el-button>
        <el-button @click="exportProcedures">
          <el-icon><Download /></el-icon>
          导出程序
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><Files /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">程序总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.active }}</div>
              <div class="stat-label">有效程序</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon review">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.review }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon revision">
              <el-icon><Refresh /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.revision }}</div>
              <div class="stat-label">待修订</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-card>
        <el-form :model="searchForm" inline>
          <el-form-item label="程序编号">
            <el-input v-model="searchForm.code" placeholder="请输入程序编号" clearable />
          </el-form-item>
          <el-form-item label="程序名称">
            <el-input v-model="searchForm.name" placeholder="请输入程序名称" clearable />
          </el-form-item>
          <el-form-item label="程序类型">
            <el-select v-model="searchForm.type" placeholder="请选择程序类型" clearable>
              <el-option label="质量控制程序" value="quality_control" />
              <el-option label="检验程序" value="inspection" />
              <el-option label="管理程序" value="management" />
              <el-option label="操作程序" value="operation" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="有效" value="active" />
              <el-option label="待审核" value="review" />
              <el-option label="待修订" value="revision" />
              <el-option label="已废止" value="obsolete" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchProcedures">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 程序列表 -->
    <div class="table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>作业程序列表</span>
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
        <el-table v-if="viewMode === 'table'" :data="procedureList" stripe>
          <el-table-column prop="code" label="程序编号" width="150" />
          <el-table-column prop="name" label="程序名称" min-width="200" />
          <el-table-column prop="type" label="程序类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="department" label="责任部门" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewProcedure(row)">查看</el-button>
              <el-button size="small" type="primary" @click="editProcedure(row)">编辑</el-button>
              <el-button size="small" type="success" @click="approveProcedure(row)" v-if="row.status === 'review'">审核</el-button>
              <el-button size="small" type="danger" @click="deleteProcedure(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 卡片视图 -->
        <div v-else class="card-view">
          <el-row :gutter="20">
            <el-col :span="8" v-for="procedure in procedureList" :key="procedure.id">
              <div class="procedure-card">
                <div class="card-header">
                  <div class="card-title">{{ procedure.name }}</div>
                  <el-tag :type="getStatusTagType(procedure.status)" size="small">
                    {{ getStatusLabel(procedure.status) }}
                  </el-tag>
                </div>
                <div class="card-content">
                  <div class="card-info">
                    <div class="info-item">
                      <span class="label">程序编号：</span>
                      <span class="value">{{ procedure.code }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">程序类型：</span>
                      <el-tag :type="getTypeTagType(procedure.type)" size="small">
                        {{ getTypeLabel(procedure.type) }}
                      </el-tag>
                    </div>
                    <div class="info-item">
                      <span class="label">版本：</span>
                      <span class="value">{{ procedure.version }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">责任部门：</span>
                      <span class="value">{{ procedure.department }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button size="small" @click="viewProcedure(procedure)">查看</el-button>
                  <el-button size="small" type="primary" @click="editProcedure(procedure)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteProcedure(procedure)">删除</el-button>
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

    <!-- 新增/编辑程序对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingProcedure ? '编辑程序' : '新增程序'"
      width="900px"
      @close="resetForm"
    >
      <el-form :model="procedureForm" :rules="formRules" ref="procedureFormRef" label-width="120px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="程序编号" prop="code">
                  <el-input v-model="procedureForm.code" placeholder="请输入程序编号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="程序名称" prop="name">
                  <el-input v-model="procedureForm.name" placeholder="请输入程序名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="程序类型" prop="type">
                  <el-select v-model="procedureForm.type" placeholder="请选择程序类型">
                    <el-option label="质量控制程序" value="quality_control" />
                    <el-option label="检验程序" value="inspection" />
                    <el-option label="管理程序" value="management" />
                    <el-option label="操作程序" value="operation" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="版本" prop="version">
                  <el-input v-model="procedureForm.version" placeholder="请输入版本号" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="责任部门" prop="department">
                  <el-select v-model="procedureForm.department" placeholder="请选择责任部门">
                    <el-option label="质量部" value="quality" />
                    <el-option label="生产部" value="production" />
                    <el-option label="技术部" value="technology" />
                    <el-option label="管理部" value="management" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生效日期" prop="effectiveDate">
                  <el-date-picker
                    v-model="procedureForm.effectiveDate"
                    type="date"
                    placeholder="请选择生效日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="程序目的" prop="purpose">
              <el-input
                v-model="procedureForm.purpose"
                type="textarea"
                :rows="3"
                placeholder="请输入程序目的"
              />
            </el-form-item>
            <el-form-item label="适用范围" prop="scope">
              <el-input
                v-model="procedureForm.scope"
                type="textarea"
                :rows="3"
                placeholder="请输入适用范围"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="程序内容" name="content">
            <el-form-item label="程序步骤" prop="steps">
              <div class="steps-editor">
                <div v-for="(step, index) in procedureForm.steps" :key="index" class="step-item">
                  <div class="step-header">
                    <span class="step-number">步骤 {{ index + 1 }}</span>
                    <el-button size="small" type="danger" @click="removeStep(index)">删除</el-button>
                  </div>
                  <el-input
                    v-model="step.title"
                    placeholder="请输入步骤标题"
                    style="margin-bottom: 8px"
                  />
                  <el-input
                    v-model="step.content"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入步骤内容"
                  />
                </div>
                <el-button @click="addStep" type="primary" plain>
                  <el-icon><Plus /></el-icon>
                  添加步骤
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="注意事项" prop="notes">
              <el-input
                v-model="procedureForm.notes"
                type="textarea"
                :rows="4"
                placeholder="请输入注意事项"
              />
            </el-form-item>
            
            <el-form-item label="相关记录" prop="records">
              <el-input
                v-model="procedureForm.records"
                type="textarea"
                :rows="3"
                placeholder="请输入相关记录要求"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="附件上传" name="attachments">
            <el-form-item label="程序文档">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                multiple
                :file-list="procedureForm.attachments"
                :before-upload="beforeUpload"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 PDF、DOC、DOCX 格式文件，且不超过 20MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProcedure">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 程序详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="程序详情" width="1000px">
      <div v-if="selectedProcedure" class="procedure-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="程序编号">{{ selectedProcedure.code }}</el-descriptions-item>
          <el-descriptions-item label="程序名称">{{ selectedProcedure.name }}</el-descriptions-item>
          <el-descriptions-item label="程序类型">
            <el-tag :type="getTypeTagType(selectedProcedure.type)">
              {{ getTypeLabel(selectedProcedure.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="版本">{{ selectedProcedure.version }}</el-descriptions-item>
          <el-descriptions-item label="责任部门">{{ selectedProcedure.department }}</el-descriptions-item>
          <el-descriptions-item label="生效日期">{{ selectedProcedure.effectiveDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedProcedure.status)">
              {{ getStatusLabel(selectedProcedure.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedProcedure.createTime }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section">
          <h4>程序目的</h4>
          <p>{{ selectedProcedure.purpose }}</p>
        </div>
        
        <div class="detail-section">
          <h4>适用范围</h4>
          <p>{{ selectedProcedure.scope }}</p>
        </div>
        
        <div class="detail-section">
          <h4>程序步骤</h4>
          <div class="steps-display">
            <div v-for="(step, index) in selectedProcedure.steps" :key="index" class="step-display">
              <div class="step-title">{{ index + 1 }}. {{ step.title }}</div>
              <div class="step-content">{{ step.content }}</div>
            </div>
          </div>
        </div>
        
        <div class="detail-section" v-if="selectedProcedure.notes">
          <h4>注意事项</h4>
          <p>{{ selectedProcedure.notes }}</p>
        </div>
        
        <div class="detail-section" v-if="selectedProcedure.records">
          <h4>相关记录</h4>
          <p>{{ selectedProcedure.records }}</p>
        </div>
        
        <div class="detail-section" v-if="selectedProcedure.attachments && selectedProcedure.attachments.length">
          <h4>相关附件</h4>
          <div class="attachment-list">
            <div v-for="file in selectedProcedure.attachments" :key="file.id" class="attachment-item">
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
              <el-button size="small" type="primary" link @click="downloadFile(file)">下载</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="showApprovalDialog" title="程序审核" width="600px">
      <el-form :model="approvalForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="approvalForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showApprovalDialog = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">提交审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'QualityProcedure',
  setup() {
    // 响应式数据
    const viewMode = ref('table')
    const showAddDialog = ref(false)
    const showDetailDialog = ref(false)
    const showApprovalDialog = ref(false)
    const editingProcedure = ref(null)
    const selectedProcedure = ref(null)
    const procedureFormRef = ref(null)
    const activeTab = ref('basic')

    // 统计数据
    const statistics = reactive({
      total: 89,
      active: 76,
      review: 8,
      revision: 5
    })

    // 搜索表单
    const searchForm = reactive({
      code: '',
      name: '',
      type: '',
      status: ''
    })

    // 程序表单
    const procedureForm = reactive({
      code: '',
      name: '',
      type: '',
      version: '',
      department: '',
      effectiveDate: '',
      purpose: '',
      scope: '',
      steps: [
        { title: '', content: '' }
      ],
      notes: '',
      records: '',
      attachments: []
    })

    // 审核表单
    const approvalForm = reactive({
      result: 'approved',
      comment: ''
    })

    // 表单验证规则
    const formRules = {
      code: [
        { required: true, message: '请输入程序编号', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入程序名称', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择程序类型', trigger: 'change' }
      ],
      version: [
        { required: true, message: '请输入版本号', trigger: 'blur' }
      ],
      department: [
        { required: true, message: '请选择责任部门', trigger: 'change' }
      ],
      effectiveDate: [
        { required: true, message: '请选择生效日期', trigger: 'change' }
      ]
    }

    // 分页数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 89
    })

    // 程序列表数据
    const procedureList = ref([
      {
        id: 1,
        code: 'QP-001',
        name: '来料检验作业程序',
        type: 'inspection',
        version: '2.1',
        department: '质量部',
        effectiveDate: '2023-01-15',
        status: 'active',
        purpose: '规范来料检验流程，确保原材料质量符合要求',
        scope: '适用于所有外购原材料、零部件的检验',
        steps: [
          { title: '检验准备', content: '准备检验设备、工具和相关文件' },
          { title: '外观检查', content: '检查包装完整性、标识清晰度等' },
          { title: '尺寸测量', content: '按照图纸要求进行尺寸测量' },
          { title: '性能测试', content: '根据技术要求进行性能测试' },
          { title: '结果判定', content: '根据检验标准判定合格与否' }
        ],
        notes: '检验过程中发现异常应立即停止并报告',
        records: '《来料检验记录表》、《不合格品处理单》',
        createTime: '2023-01-10 09:00:00',
        attachments: [
          { id: 1, name: '来料检验作业程序.pdf' },
          { id: 2, name: '检验记录表模板.xlsx' }
        ]
      },
      {
        id: 2,
        code: 'QP-002',
        name: '过程检验作业程序',
        type: 'inspection',
        version: '1.8',
        department: '生产部',
        effectiveDate: '2023-02-01',
        status: 'active',
        purpose: '规范生产过程中的质量检验，确保过程质量受控',
        scope: '适用于所有生产工序的过程检验',
        steps: [
          { title: '首件检验', content: '每批次生产开始前进行首件检验' },
          { title: '巡回检验', content: '按规定频次进行巡回检验' },
          { title: '末件检验', content: '每批次生产结束后进行末件检验' }
        ],
        notes: '发现质量异常应立即停产整改',
        records: '《过程检验记录表》',
        createTime: '2023-01-25 14:30:00',
        attachments: []
      },
      {
        id: 3,
        code: 'QP-003',
        name: '文件控制程序',
        type: 'management',
        version: '3.0',
        department: '管理部',
        effectiveDate: '2023-03-01',
        status: 'review',
        purpose: '确保质量管理体系文件的有效控制',
        scope: '适用于质量管理体系所有受控文件',
        steps: [
          { title: '文件编制', content: '按照规定格式编制文件' },
          { title: '文件审核', content: '相关部门负责人审核文件' },
          { title: '文件批准', content: '管理者代表批准文件' },
          { title: '文件发布', content: '按照发放清单发布文件' }
        ],
        notes: '文件修订需重新履行审批程序',
        records: '《文件发放清单》、《文件修订记录》',
        createTime: '2023-02-20 10:15:00',
        attachments: [
          { id: 3, name: '文件控制程序.docx' }
        ]
      }
    ])

    // 方法
    const searchProcedures = () => {
      ElMessage.success('搜索完成')
    }

    const resetSearch = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
      })
      searchProcedures()
    }

    const viewProcedure = (procedure) => {
      selectedProcedure.value = procedure
      showDetailDialog.value = true
    }

    const editProcedure = (procedure) => {
      editingProcedure.value = procedure
      Object.keys(procedureForm).forEach(key => {
        if (procedure[key] !== undefined) {
          procedureForm[key] = procedure[key]
        }
      })
      showAddDialog.value = true
    }

    const deleteProcedure = (procedure) => {
      ElMessageBox.confirm(
        `确定要删除程序"${procedure.name}"吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('删除成功')
      })
    }

    const approveProcedure = (procedure) => {
      selectedProcedure.value = procedure
      showApprovalDialog.value = true
    }

    const saveProcedure = () => {
      procedureFormRef.value.validate((valid) => {
        if (valid) {
          ElMessage.success(editingProcedure.value ? '更新成功' : '创建成功')
          showAddDialog.value = false
          resetForm()
        }
      })
    }

    const submitApproval = () => {
      ElMessage.success('审核提交成功')
      showApprovalDialog.value = false
    }

    const resetForm = () => {
      editingProcedure.value = null
      activeTab.value = 'basic'
      Object.keys(procedureForm).forEach(key => {
        if (Array.isArray(procedureForm[key])) {
          if (key === 'steps') {
            procedureForm[key] = [{ title: '', content: '' }]
          } else {
            procedureForm[key] = []
          }
        } else {
          procedureForm[key] = ''
        }
      })
      if (procedureFormRef.value) {
        procedureFormRef.value.resetFields()
      }
    }

    const addStep = () => {
      procedureForm.steps.push({ title: '', content: '' })
    }

    const removeStep = (index) => {
      if (procedureForm.steps.length > 1) {
        procedureForm.steps.splice(index, 1)
      }
    }

    const exportProcedures = () => {
      ElMessage.success('导出成功')
    }

    const beforeUpload = (file) => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isValidType) {
        ElMessage.error('只能上传 PDF、DOC、DOCX 格式的文件!')
        return false
      }
      if (!isLt20M) {
        ElMessage.error('文件大小不能超过 20MB!')
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
        quality_control: '质量控制程序',
        inspection: '检验程序',
        management: '管理程序',
        operation: '操作程序'
      }
      return labels[type] || type
    }

    const getTypeTagType = (type) => {
      const types = {
        quality_control: 'danger',
        inspection: 'warning',
        management: 'info',
        operation: 'success'
      }
      return types[type] || ''
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: '有效',
        review: '待审核',
        revision: '待修订',
        obsolete: '已废止'
      }
      return labels[status] || status
    }

    const getStatusTagType = (status) => {
      const types = {
        active: 'success',
        review: 'warning',
        revision: 'info',
        obsolete: 'danger'
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
      showApprovalDialog,
      editingProcedure,
      selectedProcedure,
      procedureFormRef,
      activeTab,
      statistics,
      searchForm,
      procedureForm,
      approvalForm,
      formRules,
      pagination,
      procedureList,
      searchProcedures,
      resetSearch,
      viewProcedure,
      editProcedure,
      deleteProcedure,
      approveProcedure,
      saveProcedure,
      submitApproval,
      resetForm,
      addStep,
      removeStep,
      exportProcedures,
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
.procedure-container {
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
      &.review { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.revision { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
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
  .procedure-card {
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

.steps-editor {
  .step-item {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .step-number {
        font-weight: 600;
        color: #409eff;
      }
    }
  }
}

.procedure-detail {
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

  .steps-display {
    .step-display {
      border-left: 3px solid #409eff;
      padding-left: 16px;
      margin-bottom: 16px;

      .step-title {
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }

      .step-content {
        color: #606266;
        line-height: 1.6;
      }
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
