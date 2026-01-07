<template>
  <div class="user-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><User /></el-icon>
          用户管理
        </h1>
        <p class="page-description">管理系统用户账户、权限分配和用户信息维护</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button @click="exportUsers">
          <el-icon><Download /></el-icon>
          导出用户
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">用户总数</div>
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
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon online">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.online }}</div>
              <div class="stat-label">在线用户</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon disabled">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.disabled }}</div>
              <div class="stat-label">禁用用户</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-card>
        <el-form :model="searchForm" inline>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="searchForm.realName" placeholder="请输入姓名" clearable />
          </el-form-item>
          <el-form-item label="部门">
            <el-select v-model="searchForm.department" placeholder="请选择部门" clearable>
              <el-option label="质量部" value="quality" />
              <el-option label="生产部" value="production" />
              <el-option label="技术部" value="technology" />
              <el-option label="管理部" value="management" />
              <el-option label="销售部" value="sales" />
            </el-select>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
              <el-option label="系统管理员" value="admin" />
              <el-option label="质量经理" value="quality_manager" />
              <el-option label="检验员" value="inspector" />
              <el-option label="操作员" value="operator" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
              <el-option label="锁定" value="locked" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchUsers">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 用户列表 -->
    <div class="table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>用户列表</span>
            <div class="table-actions">
              <el-button size="small" @click="batchEnable" :disabled="!selectedUsers.length">
                批量启用
              </el-button>
              <el-button size="small" @click="batchDisable" :disabled="!selectedUsers.length">
                批量禁用
              </el-button>
            </div>
          </div>
        </template>

        <el-table 
          :data="userList" 
          stripe 
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="头像" width="80">
            <template #default="{ row }">
              <el-avatar :src="row.avatar" :size="40">
                {{ row.realName?.charAt(0) }}
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="realName" label="姓名" width="100" />
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="phone" label="电话" width="120" />
          <el-table-column prop="department" label="部门" width="100">
            <template #default="{ row }">
              {{ getDepartmentLabel(row.department) }}
            </template>
          </el-table-column>
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="getRoleTagType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastLoginTime" label="最后登录" width="150" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewUser(row)">查看</el-button>
              <el-button size="small" type="primary" @click="editUser(row)">编辑</el-button>
              <el-button 
                size="small" 
                :type="row.status === 'active' ? 'warning' : 'success'" 
                @click="toggleUserStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
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
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="userForm" :rules="formRules" ref="userFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="userForm.realName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="userForm.department" placeholder="请选择部门">
                <el-option label="质量部" value="quality" />
                <el-option label="生产部" value="production" />
                <el-option label="技术部" value="technology" />
                <el-option label="管理部" value="management" />
                <el-option label="销售部" value="sales" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" placeholder="请选择角色">
                <el-option label="系统管理员" value="admin" />
                <el-option label="质量经理" value="quality_manager" />
                <el-option label="检验员" value="inspector" />
                <el-option label="操作员" value="operator" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="!editingUser">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="userForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="头像上传">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
          >
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="userForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="用户详情" width="600px">
      <div v-if="selectedUser" class="user-detail">
        <div class="user-info">
          <div class="avatar-section">
            <el-avatar :src="selectedUser.avatar" :size="80">
              {{ selectedUser.realName?.charAt(0) }}
            </el-avatar>
          </div>
          <div class="info-section">
            <h3>{{ selectedUser.realName }}</h3>
            <p>{{ selectedUser.username }}</p>
            <el-tag :type="getStatusTagType(selectedUser.status)">
              {{ getStatusLabel(selectedUser.status) }}
            </el-tag>
          </div>
        </div>
        
        <el-descriptions :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedUser.realName }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ selectedUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ getDepartmentLabel(selectedUser.department) }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleTagType(selectedUser.role)">
              {{ getRoleLabel(selectedUser.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedUser.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ selectedUser.lastLoginTime }}</el-descriptions-item>
        </el-descriptions>
        
        <div v-if="selectedUser.remark" style="margin-top: 20px">
          <h4>备注信息</h4>
          <p>{{ selectedUser.remark }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="重置密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="resetPassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'UserManagement',
  setup() {
    // 响应式数据
    const showAddDialog = ref(false)
    const showDetailDialog = ref(false)
    const showPasswordDialog = ref(false)
    const editingUser = ref(null)
    const selectedUser = ref(null)
    const selectedUsers = ref([])
    const userFormRef = ref(null)
    const passwordFormRef = ref(null)

    // 统计数据
    const statistics = reactive({
      total: 128,
      active: 115,
      online: 23,
      disabled: 13
    })

    // 搜索表单
    const searchForm = reactive({
      username: '',
      realName: '',
      department: '',
      role: '',
      status: ''
    })

    // 用户表单
    const userForm = reactive({
      username: '',
      realName: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      password: '',
      confirmPassword: '',
      avatar: '',
      remark: ''
    })

    // 密码表单
    const passwordForm = reactive({
      newPassword: '',
      confirmPassword: ''
    })

    // 表单验证规则
    const formRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      realName: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      department: [
        { required: true, message: '请选择部门', trigger: 'change' }
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== userForm.password) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    // 密码验证规则
    const passwordRules = {
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    // 分页数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 128
    })

    // 用户列表数据
    const userList = ref([
      {
        id: 1,
        username: 'admin',
        realName: '系统管理员',
        email: 'admin@qms.com',
        phone: '13800138000',
        department: 'management',
        role: 'admin',
        status: 'active',
        avatar: '',
        createTime: '2023-01-01 09:00:00',
        lastLoginTime: '2024-01-07 20:30:00',
        remark: '系统超级管理员账户'
      },
      {
        id: 2,
        username: 'quality_manager',
        realName: '张质量',
        email: 'zhang@qms.com',
        phone: '13800138001',
        department: 'quality',
        role: 'quality_manager',
        status: 'active',
        avatar: '',
        createTime: '2023-01-15 10:30:00',
        lastLoginTime: '2024-01-07 18:45:00',
        remark: '质量部门负责人'
      },
      {
        id: 3,
        username: 'inspector01',
        realName: '李检验',
        email: 'li@qms.com',
        phone: '13800138002',
        department: 'quality',
        role: 'inspector',
        status: 'active',
        avatar: '',
        createTime: '2023-02-01 14:20:00',
        lastLoginTime: '2024-01-07 16:20:00',
        remark: '来料检验员'
      },
      {
        id: 4,
        username: 'operator01',
        realName: '王操作',
        email: 'wang@qms.com',
        phone: '13800138003',
        department: 'production',
        role: 'operator',
        status: 'disabled',
        avatar: '',
        createTime: '2023-03-01 09:15:00',
        lastLoginTime: '2024-01-05 17:30:00',
        remark: '生产线操作员'
      }
    ])

    // 方法
    const searchUsers = () => {
      ElMessage.success('搜索完成')
    }

    const resetSearch = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
      })
      searchUsers()
    }

    const handleSelectionChange = (selection) => {
      selectedUsers.value = selection
    }

    const viewUser = (user) => {
      selectedUser.value = user
      showDetailDialog.value = true
    }

    const editUser = (user) => {
      editingUser.value = user
      Object.keys(userForm).forEach(key => {
        if (user[key] !== undefined) {
          userForm[key] = user[key]
        }
      })
      // 编辑时不需要密码字段
      userForm.password = ''
      userForm.confirmPassword = ''
      showAddDialog.value = true
    }

    const deleteUser = (user) => {
      ElMessageBox.confirm(
        `确定要删除用户"${user.realName}"吗？`,
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

    const toggleUserStatus = (user) => {
      const action = user.status === 'active' ? '禁用' : '启用'
      ElMessageBox.confirm(
        `确定要${action}用户"${user.realName}"吗？`,
        `确认${action}`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        user.status = user.status === 'active' ? 'disabled' : 'active'
        ElMessage.success(`${action}成功`)
      })
    }

    const batchEnable = () => {
      ElMessageBox.confirm(
        `确定要启用选中的 ${selectedUsers.value.length} 个用户吗？`,
        '确认启用',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('批量启用成功')
      })
    }

    const batchDisable = () => {
      ElMessageBox.confirm(
        `确定要禁用选中的 ${selectedUsers.value.length} 个用户吗？`,
        '确认禁用',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('批量禁用成功')
      })
    }

    const saveUser = () => {
      userFormRef.value.validate((valid) => {
        if (valid) {
          ElMessage.success(editingUser.value ? '更新成功' : '创建成功')
          showAddDialog.value = false
          resetForm()
        }
      })
    }

    const resetPassword = () => {
      passwordFormRef.value.validate((valid) => {
        if (valid) {
          ElMessage.success('密码重置成功')
          showPasswordDialog.value = false
          Object.keys(passwordForm).forEach(key => {
            passwordForm[key] = ''
          })
        }
      })
    }

    const resetForm = () => {
      editingUser.value = null
      Object.keys(userForm).forEach(key => {
        userForm[key] = ''
      })
      if (userFormRef.value) {
        userFormRef.value.resetFields()
      }
    }

    const exportUsers = () => {
      ElMessage.success('导出成功')
    }

    const beforeAvatarUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        ElMessage.error('头像只能是 JPG/PNG 格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('头像大小不能超过 2MB!')
        return false
      }
      return true
    }

    const handleAvatarSuccess = (response, file) => {
      userForm.avatar = URL.createObjectURL(file.raw)
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
    const getDepartmentLabel = (department) => {
      const labels = {
        quality: '质量部',
        production: '生产部',
        technology: '技术部',
        management: '管理部',
        sales: '销售部'
      }
      return labels[department] || department
    }

    const getRoleLabel = (role) => {
      const labels = {
        admin: '系统管理员',
        quality_manager: '质量经理',
        inspector: '检验员',
        operator: '操作员'
      }
      return labels[role] || role
    }

    const getRoleTagType = (role) => {
      const types = {
        admin: 'danger',
        quality_manager: 'warning',
        inspector: 'success',
        operator: 'info'
      }
      return types[role] || ''
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: '正常',
        disabled: '禁用',
        locked: '锁定'
      }
      return labels[status] || status
    }

    const getStatusTagType = (status) => {
      const types = {
        active: 'success',
        disabled: 'danger',
        locked: 'warning'
      }
      return types[status] || ''
    }

    onMounted(() => {
      // 初始化数据
    })

    return {
      showAddDialog,
      showDetailDialog,
      showPasswordDialog,
      editingUser,
      selectedUser,
      selectedUsers,
      userFormRef,
      passwordFormRef,
      statistics,
      searchForm,
      userForm,
      passwordForm,
      formRules,
      passwordRules,
      pagination,
      userList,
      searchUsers,
      resetSearch,
      handleSelectionChange,
      viewUser,
      editUser,
      deleteUser,
      toggleUserStatus,
      batchEnable,
      batchDisable,
      saveUser,
      resetPassword,
      resetForm,
      exportUsers,
      beforeAvatarUpload,
      handleAvatarSuccess,
      handleSizeChange,
      handleCurrentChange,
      getDepartmentLabel,
      getRoleLabel,
      getRoleTagType,
      getStatusLabel,
      getStatusTagType
    }
  }
}
</script>

<style lang="scss" scoped>
.user-container {
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
      &.online { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.disabled { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
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

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.user-detail {
  .user-info {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;

    .avatar-section {
      flex-shrink: 0;
    }

    .info-section {
      h3 {
        margin: 0 0 8px 0;
        color: #303133;
        font-size: 20px;
      }

      p {
        margin: 0 0 12px 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

.avatar-uploader {
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 6px;
    display: block;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: .3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #409eff;
    }
  }
}
</style>
