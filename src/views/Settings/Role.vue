<template>
  <div class="role-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>角色权限管理</h2>
      <p>管理系统角色和权限分配，确保用户访问控制的安全性</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ roleStats.totalRoles }}</div>
                <div class="stats-label">总角色数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon active">
                <el-icon><Key /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ roleStats.activeRoles }}</div>
                <div class="stats-label">启用角色</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon permission">
                <el-icon><Lock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ roleStats.totalPermissions }}</div>
                <div class="stats-label">权限总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon users">
                <el-icon><Avatar /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ roleStats.assignedUsers }}</div>
                <div class="stats-label">已分配用户</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <div class="left-actions">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      <div class="right-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索角色名称或描述"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 角色列表 -->
    <el-card class="table-card">
      <el-table
        :data="filteredRoles"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="角色名称" width="150">
          <template #default="{ row }">
            <div class="role-name">
              <el-tag :type="getRoleTagType(row.level)" size="small">
                {{ row.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="角色编码" width="120" />
        <el-table-column prop="description" label="角色描述" min-width="200" />
        <el-table-column prop="level" label="角色级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)" size="small">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="用户数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showPermissionDialog(row)">
              <el-icon><Key /></el-icon>
              权限配置
            </el-button>
            <el-button type="primary" link @click="showEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)" :disabled="row.userCount > 0">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialog.visible"
      :title="roleDialog.isEdit ? '编辑角色' : '新增角色'"
      width="600px"
      @close="resetRoleForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" :disabled="roleDialog.isEdit" />
        </el-form-item>
        <el-form-item label="角色级别" prop="level">
          <el-select v-model="roleForm.level" placeholder="请选择角色级别" style="width: 100%">
            <el-option label="超级管理员" value="1" />
            <el-option label="系统管理员" value="2" />
            <el-option label="部门管理员" value="3" />
            <el-option label="普通用户" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit" :loading="submitting">
          {{ roleDialog.isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialog.visible"
      title="权限配置"
      width="800px"
      @close="resetPermissionForm"
    >
      <div class="permission-config">
        <div class="role-info">
          <h4>{{ currentRole.name }} - 权限配置</h4>
          <p>{{ currentRole.description }}</p>
        </div>
        
        <el-tabs v-model="activePermissionTab">
          <el-tab-pane label="菜单权限" name="menu">
            <div class="permission-tree">
              <el-tree
                ref="menuTreeRef"
                :data="menuPermissions"
                :props="treeProps"
                show-checkbox
                node-key="id"
                :default-checked-keys="checkedMenus"
                @check="handleMenuCheck"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="操作权限" name="action">
            <div class="action-permissions">
              <el-row :gutter="20">
                <el-col :span="8" v-for="module in actionPermissions" :key="module.id">
                  <el-card class="module-card">
                    <template #header>
                      <div class="module-header">
                        <el-checkbox
                          v-model="module.checked"
                          :indeterminate="module.indeterminate"
                          @change="handleModuleCheck(module)"
                        >
                          {{ module.name }}
                        </el-checkbox>
                      </div>
                    </template>
                    <el-checkbox-group v-model="module.checkedActions" @change="handleActionCheck(module)">
                      <div class="action-item" v-for="action in module.actions" :key="action.id">
                        <el-checkbox :label="action.id">{{ action.name }}</el-checkbox>
                      </div>
                    </el-checkbox-group>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          <el-tab-pane label="数据权限" name="data">
            <div class="data-permissions">
              <el-form label-width="120px">
                <el-form-item label="数据范围">
                  <el-radio-group v-model="dataPermission.scope">
                    <el-radio label="all">全部数据</el-radio>
                    <el-radio label="dept">本部门数据</el-radio>
                    <el-radio label="self">个人数据</el-radio>
                    <el-radio label="custom">自定义数据</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="部门权限" v-if="dataPermission.scope === 'custom'">
                  <el-tree
                    ref="deptTreeRef"
                    :data="deptPermissions"
                    :props="treeProps"
                    show-checkbox
                    node-key="id"
                    :default-checked-keys="checkedDepts"
                  />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="permissionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit" :loading="submitting">
          保存权限
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Key,
  Lock,
  Avatar,
  Plus,
  Refresh,
  Search,
  Edit,
  Delete
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const selectedRoles = ref([])

// 统计数据
const roleStats = reactive({
  totalRoles: 12,
  activeRoles: 10,
  totalPermissions: 156,
  assignedUsers: 89
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 角色数据
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    description: '系统超级管理员，拥有所有权限',
    level: 1,
    userCount: 2,
    status: 1,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '系统管理员',
    code: 'SYS_ADMIN',
    description: '系统管理员，负责系统配置和用户管理',
    level: 2,
    userCount: 5,
    status: 1,
    createTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    name: '质量经理',
    code: 'QUALITY_MANAGER',
    description: '质量管理部门经理，负责质量管理相关工作',
    level: 3,
    userCount: 8,
    status: 1,
    createTime: '2024-01-03 10:00:00'
  },
  {
    id: 4,
    name: '检验员',
    code: 'INSPECTOR',
    description: '质量检验员，负责产品检验工作',
    level: 4,
    userCount: 25,
    status: 1,
    createTime: '2024-01-04 10:00:00'
  },
  {
    id: 5,
    name: '审核员',
    code: 'AUDITOR',
    description: '质量审核员，负责质量审核工作',
    level: 4,
    userCount: 12,
    status: 1,
    createTime: '2024-01-05 10:00:00'
  }
])

// 角色对话框
const roleDialog = reactive({
  visible: false,
  isEdit: false
})

const roleForm = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  level: '',
  status: 1
})

const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择角色级别', trigger: 'change' }
  ]
}

// 权限配置对话框
const permissionDialog = reactive({
  visible: false
})

const currentRole = ref({})
const activePermissionTab = ref('menu')

// 菜单权限
const menuPermissions = ref([
  {
    id: 1,
    label: '仪表盘',
    children: [
      { id: 11, label: '数据概览' },
      { id: 12, label: '质量趋势' }
    ]
  },
  {
    id: 2,
    label: '检验管理',
    children: [
      { id: 21, label: '来料检验' },
      { id: 22, label: '过程检验' },
      { id: 23, label: '成品检验' },
      { id: 24, label: '出厂检验' }
    ]
  },
  {
    id: 3,
    label: '质量控制',
    children: [
      { id: 31, label: 'SPC控制' },
      { id: 32, label: '质量预警' }
    ]
  },
  {
    id: 4,
    label: '质量分析',
    children: [
      { id: 41, label: '趋势分析' },
      { id: 42, label: '帕累托分析' },
      { id: 43, label: '鱼骨图分析' },
      { id: 44, label: '过程能力分析' }
    ]
  },
  {
    id: 5,
    label: '不合格品管理',
    children: [
      { id: 51, label: '不合格品处理' },
      { id: 52, label: '纠正预防措施' }
    ]
  },
  {
    id: 6,
    label: '供应商管理',
    children: [
      { id: 61, label: '供应商质量' },
      { id: 62, label: '供应商评估' }
    ]
  },
  {
    id: 7,
    label: '文档管理',
    children: [
      { id: 71, label: '质量标准' },
      { id: 72, label: '作业程序' },
      { id: 73, label: '质量记录' },
      { id: 74, label: '质量手册' }
    ]
  },
  {
    id: 8,
    label: '系统设置',
    children: [
      { id: 81, label: '用户管理' },
      { id: 82, label: '角色权限' },
      { id: 83, label: '系统配置' },
      { id: 84, label: '安全设置' }
    ]
  }
])

const checkedMenus = ref([11, 12, 21, 22, 41, 42])

// 操作权限
const actionPermissions = ref([
  {
    id: 1,
    name: '检验管理',
    checked: false,
    indeterminate: false,
    checkedActions: [],
    actions: [
      { id: 'inspect_view', name: '查看' },
      { id: 'inspect_add', name: '新增' },
      { id: 'inspect_edit', name: '编辑' },
      { id: 'inspect_delete', name: '删除' },
      { id: 'inspect_approve', name: '审批' }
    ]
  },
  {
    id: 2,
    name: '质量分析',
    checked: false,
    indeterminate: false,
    checkedActions: [],
    actions: [
      { id: 'analysis_view', name: '查看' },
      { id: 'analysis_export', name: '导出' },
      { id: 'analysis_config', name: '配置' }
    ]
  },
  {
    id: 3,
    name: '文档管理',
    checked: false,
    indeterminate: false,
    checkedActions: [],
    actions: [
      { id: 'doc_view', name: '查看' },
      { id: 'doc_upload', name: '上传' },
      { id: 'doc_download', name: '下载' },
      { id: 'doc_edit', name: '编辑' },
      { id: 'doc_delete', name: '删除' }
    ]
  }
])

// 数据权限
const dataPermission = reactive({
  scope: 'dept'
})

const deptPermissions = ref([
  {
    id: 1,
    label: '总公司',
    children: [
      {
        id: 11,
        label: '质量管理部',
        children: [
          { id: 111, label: '检验科' },
          { id: 112, label: '质量科' }
        ]
      },
      {
        id: 12,
        label: '生产部',
        children: [
          { id: 121, label: '生产一车间' },
          { id: 122, label: '生产二车间' }
        ]
      }
    ]
  }
])

const checkedDepts = ref([111, 112])

const treeProps = {
  children: 'children',
  label: 'label'
}

// 计算属性
const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value
  return roles.value.filter(role =>
    role.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const getRoleTagType = (level) => {
  const types = { 1: 'danger', 2: 'warning', 3: 'success', 4: '' }
  return types[level] || ''
}

const getLevelTagType = (level) => {
  const types = { 1: 'danger', 2: 'warning', 3: 'success', 4: 'info' }
  return types[level] || 'info'
}

const getLevelText = (level) => {
  const texts = { 1: '超级管理员', 2: '系统管理员', 3: '部门管理员', 4: '普通用户' }
  return texts[level] || '未知'
}

const handleSearch = () => {
  // 搜索逻辑
}

const handleSelectionChange = (selection) => {
  selectedRoles.value = selection
}

const handleStatusChange = (row) => {
  ElMessage.success(`${row.name} 状态已${row.status ? '启用' : '禁用'}`)
}

const showAddDialog = () => {
  roleDialog.isEdit = false
  roleDialog.visible = true
}

const showEditDialog = (row) => {
  roleDialog.isEdit = true
  Object.assign(roleForm, row)
  roleDialog.visible = true
}

const resetRoleForm = () => {
  Object.assign(roleForm, {
    id: null,
    name: '',
    code: '',
    description: '',
    level: '',
    status: 1
  })
}

const handleRoleSubmit = () => {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    roleDialog.visible = false
    ElMessage.success(roleDialog.isEdit ? '角色更新成功' : '角色创建成功')
    resetRoleForm()
  }, 1000)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

const showPermissionDialog = (row) => {
  currentRole.value = row
  permissionDialog.visible = true
}

const resetPermissionForm = () => {
  currentRole.value = {}
  activePermissionTab.value = 'menu'
}

const handleMenuCheck = (data, checked) => {
  // 菜单权限选择逻辑
}

const handleModuleCheck = (module) => {
  if (module.checked) {
    module.checkedActions = module.actions.map(action => action.id)
  } else {
    module.checkedActions = []
  }
  module.indeterminate = false
}

const handleActionCheck = (module) => {
  const checkedCount = module.checkedActions.length
  module.checked = checkedCount === module.actions.length
  module.indeterminate = checkedCount > 0 && checkedCount < module.actions.length
}

const handlePermissionSubmit = () => {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    permissionDialog.visible = false
    ElMessage.success('权限配置保存成功')
  }, 1000)
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据刷新成功')
  }, 1000)
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

// 生命周期
onMounted(() => {
  pagination.total = roles.value.length
})
</script>

<style lang="scss" scoped>
.role-management {
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

  .stats-cards {
    margin-bottom: 20px;

    .stats-card {
      .stats-content {
        display: flex;
        align-items: center;

        .stats-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 24px;

          &.active {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.permission {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.users {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .left-actions {
      display: flex;
      gap: 12px;
    }
  }

  .table-card {
    .role-name {
      display: flex;
      align-items: center;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .permission-config {
    .role-info {
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;

      h4 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }

    .permission-tree {
      max-height: 400px;
      overflow-y: auto;
    }

    .action-permissions {
      .module-card {
        margin-bottom: 16px;

        .module-header {
          font-weight: 600;
        }

        .action-item {
          margin-bottom: 8px;
        }
      }
    }

    .data-permissions {
      .el-form-item {
        margin-bottom: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .role-management {
    padding: 16px;

    .stats-cards {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .operation-bar {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .right-actions {
        .el-input {
          width: 100% !important;
        }
      }
    }
  }
}
</style>
