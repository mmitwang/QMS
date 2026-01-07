<template>
  <div class="security-settings">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>安全设置</h2>
      <p>管理系统安全策略、密码规则和访问控制</p>
    </div>

    <!-- 安全配置标签页 -->
    <el-tabs v-model="activeTab" class="security-tabs">
      <!-- 密码策略 -->
      <el-tab-pane label="密码策略" name="password">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>密码安全策略</span>
              <el-button type="primary" @click="savePasswordPolicy" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="passwordPolicy" label-width="180px" class="config-form">
            <el-form-item label="密码最小长度">
              <el-input-number
                v-model="passwordPolicy.minLength"
                :min="6"
                :max="32"
                style="width: 200px"
              />
              <span class="form-tip">字符</span>
            </el-form-item>
            
            <el-form-item label="密码最大长度">
              <el-input-number
                v-model="passwordPolicy.maxLength"
                :min="8"
                :max="128"
                style="width: 200px"
              />
              <span class="form-tip">字符</span>
            </el-form-item>
            
            <el-form-item label="密码复杂度要求">
              <el-checkbox-group v-model="passwordPolicy.complexity">
                <el-checkbox label="uppercase">包含大写字母</el-checkbox>
                <el-checkbox label="lowercase">包含小写字母</el-checkbox>
                <el-checkbox label="numbers">包含数字</el-checkbox>
                <el-checkbox label="symbols">包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="密码有效期">
              <el-input-number
                v-model="passwordPolicy.expireDays"
                :min="0"
                :max="365"
                style="width: 200px"
              />
              <span class="form-tip">天（0表示永不过期）</span>
            </el-form-item>
            
            <el-form-item label="密码历史记录">
              <el-input-number
                v-model="passwordPolicy.historyCount"
                :min="0"
                :max="24"
                style="width: 200px"
              />
              <span class="form-tip">个（不能重复使用最近N个密码）</span>
            </el-form-item>
            
            <el-form-item label="登录失败锁定">
              <el-switch v-model="passwordPolicy.lockoutEnabled" />
              <span class="form-tip">启用后连续登录失败将锁定账户</span>
            </el-form-item>
            
            <template v-if="passwordPolicy.lockoutEnabled">
              <el-form-item label="最大失败次数">
                <el-input-number
                  v-model="passwordPolicy.maxFailAttempts"
                  :min="3"
                  :max="10"
                  style="width: 200px"
                />
                <span class="form-tip">次</span>
              </el-form-item>
              
              <el-form-item label="锁定时间">
                <el-input-number
                  v-model="passwordPolicy.lockoutDuration"
                  :min="5"
                  :max="1440"
                  style="width: 200px"
                />
                <span class="form-tip">分钟</span>
              </el-form-item>
            </template>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 会话管理 -->
      <el-tab-pane label="会话管理" name="session">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>用户会话管理</span>
              <el-button type="primary" @click="saveSessionConfig" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="sessionConfig" label-width="180px" class="config-form">
            <el-form-item label="会话超时时间">
              <el-input-number
                v-model="sessionConfig.timeout"
                :min="15"
                :max="1440"
                style="width: 200px"
              />
              <span class="form-tip">分钟</span>
            </el-form-item>
            
            <el-form-item label="记住登录状态">
              <el-switch v-model="sessionConfig.rememberMe" />
              <span class="form-tip">允许用户选择记住登录状态</span>
            </el-form-item>
            
            <el-form-item label="记住登录时长" v-if="sessionConfig.rememberMe">
              <el-input-number
                v-model="sessionConfig.rememberDays"
                :min="1"
                :max="30"
                style="width: 200px"
              />
              <span class="form-tip">天</span>
            </el-form-item>
            
            <el-form-item label="单点登录">
              <el-switch v-model="sessionConfig.singleSignOn" />
              <span class="form-tip">同一账户只能在一个地方登录</span>
            </el-form-item>
            
            <el-form-item label="强制HTTPS">
              <el-switch v-model="sessionConfig.forceHttps" />
              <span class="form-tip">强制使用HTTPS协议访问</span>
            </el-form-item>
            
            <el-form-item label="IP地址验证">
              <el-switch v-model="sessionConfig.ipValidation" />
              <span class="form-tip">验证用户IP地址变化</span>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 在线用户管理 -->
        <el-card class="config-card" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>在线用户管理</span>
              <el-button @click="refreshOnlineUsers" :loading="refreshing">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <el-table :data="onlineUsers" style="width: 100%" v-loading="loading">
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="realName" label="真实姓名" width="120" />
            <el-table-column prop="ipAddress" label="IP地址" width="140" />
            <el-table-column prop="location" label="登录地点" width="150" />
            <el-table-column prop="browser" label="浏览器" width="120" />
            <el-table-column prop="loginTime" label="登录时间" width="180" />
            <el-table-column prop="lastActivity" label="最后活动" width="180" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" link @click="forceLogout(row)">
                  <el-icon><Close /></el-icon>
                  强制下线
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 访问控制 -->
      <el-tab-pane label="访问控制" name="access">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>IP访问控制</span>
              <el-button type="primary" @click="saveAccessControl" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="accessControl" label-width="180px" class="config-form">
            <el-form-item label="启用IP白名单">
              <el-switch v-model="accessControl.whitelistEnabled" />
              <span class="form-tip">只允许白名单内的IP访问</span>
            </el-form-item>
            
            <el-form-item label="IP白名单" v-if="accessControl.whitelistEnabled">
              <div class="ip-list">
                <div class="ip-item" v-for="(ip, index) in accessControl.whitelist" :key="index">
                  <el-input v-model="accessControl.whitelist[index]" placeholder="请输入IP地址或IP段" />
                  <el-button type="danger" link @click="removeWhitelistIP(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-button type="primary" link @click="addWhitelistIP">
                  <el-icon><Plus /></el-icon>
                  添加IP
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="启用IP黑名单">
              <el-switch v-model="accessControl.blacklistEnabled" />
              <span class="form-tip">禁止黑名单内的IP访问</span>
            </el-form-item>
            
            <el-form-item label="IP黑名单" v-if="accessControl.blacklistEnabled">
              <div class="ip-list">
                <div class="ip-item" v-for="(ip, index) in accessControl.blacklist" :key="index">
                  <el-input v-model="accessControl.blacklist[index]" placeholder="请输入IP地址或IP段" />
                  <el-button type="danger" link @click="removeBlacklistIP(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-button type="primary" link @click="addBlacklistIP">
                  <el-icon><Plus /></el-icon>
                  添加IP
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="访问时间限制">
              <el-switch v-model="accessControl.timeRestriction" />
              <span class="form-tip">限制系统访问时间</span>
            </el-form-item>
            
            <el-form-item label="允许访问时间" v-if="accessControl.timeRestriction">
              <el-time-picker
                v-model="accessControl.allowedTimeRange"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm"
                value-format="HH:mm"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 审计日志 -->
      <el-tab-pane label="审计日志" name="audit">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>审计日志配置</span>
              <el-button type="primary" @click="saveAuditConfig" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="auditConfig" label-width="180px" class="config-form">
            <el-form-item label="启用审计日志">
              <el-switch v-model="auditConfig.enabled" />
              <span class="form-tip">记录用户操作和系统事件</span>
            </el-form-item>
            
            <template v-if="auditConfig.enabled">
              <el-form-item label="记录级别">
                <el-select v-model="auditConfig.level" style="width: 200px">
                  <el-option label="基础" value="basic" />
                  <el-option label="详细" value="detailed" />
                  <el-option label="完整" value="full" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="记录事件类型">
                <el-checkbox-group v-model="auditConfig.eventTypes">
                  <el-checkbox label="login">用户登录</el-checkbox>
                  <el-checkbox label="logout">用户登出</el-checkbox>
                  <el-checkbox label="create">数据创建</el-checkbox>
                  <el-checkbox label="update">数据更新</el-checkbox>
                  <el-checkbox label="delete">数据删除</el-checkbox>
                  <el-checkbox label="export">数据导出</el-checkbox>
                  <el-checkbox label="config">配置变更</el-checkbox>
                  <el-checkbox label="security">安全事件</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="日志保留时间">
                <el-input-number
                  v-model="auditConfig.retentionDays"
                  :min="30"
                  :max="3650"
                  style="width: 200px"
                />
                <span class="form-tip">天</span>
              </el-form-item>
              
              <el-form-item label="自动清理">
                <el-switch v-model="auditConfig.autoCleanup" />
                <span class="form-tip">自动清理过期的审计日志</span>
              </el-form-item>
            </template>
          </el-form>
        </el-card>

        <!-- 审计日志查询 -->
        <el-card class="config-card" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>审计日志查询</span>
              <div class="header-actions">
                <el-button @click="exportAuditLogs" :loading="exporting">
                  <el-icon><Download /></el-icon>
                  导出日志
                </el-button>
                <el-button @click="refreshAuditLogs" :loading="refreshing">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>
          
          <!-- 查询条件 -->
          <div class="search-form">
            <el-form :model="auditSearch" :inline="true">
              <el-form-item label="用户名">
                <el-input v-model="auditSearch.username" placeholder="请输入用户名" clearable />
              </el-form-item>
              <el-form-item label="操作类型">
                <el-select v-model="auditSearch.eventType" placeholder="请选择操作类型" clearable>
                  <el-option label="用户登录" value="login" />
                  <el-option label="用户登出" value="logout" />
                  <el-option label="数据创建" value="create" />
                  <el-option label="数据更新" value="update" />
                  <el-option label="数据删除" value="delete" />
                  <el-option label="数据导出" value="export" />
                  <el-option label="配置变更" value="config" />
                  <el-option label="安全事件" value="security" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="auditSearch.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchAuditLogs">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="resetAuditSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 审计日志表格 -->
          <el-table :data="auditLogs" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="eventType" label="操作类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getEventTypeTag(row.eventType)" size="small">
                  {{ getEventTypeName(row.eventType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="操作描述" min-width="200" />
            <el-table-column prop="ipAddress" label="IP地址" width="140" />
            <el-table-column prop="userAgent" label="用户代理" width="150" show-overflow-tooltip />
            <el-table-column prop="createTime" label="操作时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewAuditDetail(row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="auditPagination.currentPage"
              v-model:page-size="auditPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="auditPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleAuditSizeChange"
              @current-change="handleAuditCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 安全监控 -->
      <el-tab-pane label="安全监控" name="monitor">
        <el-row :gutter="20">
          <!-- 安全统计 -->
          <el-col :span="12">
            <el-card class="config-card">
              <template #header>
                <span>安全统计</span>
              </template>
              
              <div class="security-stats">
                <div class="stat-item">
                  <div class="stat-icon success">
                    <el-icon><SuccessFilled /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ securityStats.successLogins }}</div>
                    <div class="stat-label">成功登录</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon warning">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ securityStats.failedLogins }}</div>
                    <div class="stat-label">失败登录</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon danger">
                    <el-icon><CircleCloseFilled /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ securityStats.blockedIPs }}</div>
                    <div class="stat-label">被阻止IP</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon info">
                    <el-icon><InfoFilled /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ securityStats.securityEvents }}</div>
                    <div class="stat-label">安全事件</div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <!-- 安全警报 -->
          <el-col :span="12">
            <el-card class="config-card">
              <template #header>
                <div class="card-header">
                  <span>安全警报</span>
                  <el-button @click="refreshSecurityAlerts" :loading="refreshing">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </template>
              
              <div class="security-alerts">
                <div class="alert-item" v-for="alert in securityAlerts" :key="alert.id">
                  <div class="alert-icon" :class="alert.level">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                  <div class="alert-content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-description">{{ alert.description }}</div>
                    <div class="alert-time">{{ alert.time }}</div>
                  </div>
                  <div class="alert-actions">
                    <el-button type="primary" link @click="handleAlert(alert)">处理</el-button>
                  </div>
                </div>
                
                <div class="no-alerts" v-if="securityAlerts.length === 0">
                  <el-empty description="暂无安全警报" />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- 审计日志详情对话框 -->
    <el-dialog v-model="auditDetailDialog.visible" title="审计日志详情" width="600px">
      <div class="audit-detail" v-if="auditDetailDialog.data">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="操作ID">{{ auditDetailDialog.data.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ auditDetailDialog.data.username }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getEventTypeTag(auditDetailDialog.data.eventType)" size="small">
              {{ getEventTypeName(auditDetailDialog.data.eventType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作描述">{{ auditDetailDialog.data.description }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ auditDetailDialog.data.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="用户代理">{{ auditDetailDialog.data.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ auditDetailDialog.data.createTime }}</el-descriptions-item>
          <el-descriptions-item label="详细信息">
            <pre>{{ JSON.stringify(auditDetailDialog.data.details, null, 2) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  Plus,
  Delete,
  Refresh,
  Close,
  Download,
  Search,
  View,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('password')
const saving = ref(false)
const loading = ref(false)
const refreshing = ref(false)
const exporting = ref(false)

// 密码策略配置
const passwordPolicy = reactive({
  minLength: 8,
  maxLength: 32,
  complexity: ['lowercase', 'numbers'],
  expireDays: 90,
  historyCount: 5,
  lockoutEnabled: true,
  maxFailAttempts: 5,
  lockoutDuration: 30
})

// 会话配置
const sessionConfig = reactive({
  timeout: 120,
  rememberMe: true,
  rememberDays: 7,
  singleSignOn: false,
  forceHttps: true,
  ipValidation: false
})

// 在线用户
const onlineUsers = ref([
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    ipAddress: '192.168.1.100',
    location: '北京市',
    browser: 'Chrome 120',
    loginTime: '2024-01-07 08:30:00',
    lastActivity: '2024-01-07 09:15:00'
  },
  {
    id: 2,
    username: 'quality_manager',
    realName: '质量经理',
    ipAddress: '192.168.1.101',
    location: '上海市',
    browser: 'Firefox 121',
    loginTime: '2024-01-07 09:00:00',
    lastActivity: '2024-01-07 09:10:00'
  }
])

// 访问控制配置
const accessControl = reactive({
  whitelistEnabled: false,
  whitelist: ['192.168.1.0/24'],
  blacklistEnabled: false,
  blacklist: [],
  timeRestriction: false,
  allowedTimeRange: ['08:00', '18:00']
})

// 审计配置
const auditConfig = reactive({
  enabled: true,
  level: 'detailed',
  eventTypes: ['login', 'logout', 'create', 'update', 'delete', 'config'],
  retentionDays: 365,
  autoCleanup: true
})

// 审计日志搜索
const auditSearch = reactive({
  username: '',
  eventType: '',
  dateRange: []
})

// 审计日志分页
const auditPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 审计日志数据
const auditLogs = ref([
  {
    id: 1,
    username: 'admin',
    eventType: 'login',
    description: '用户登录系统',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createTime: '2024-01-07 09:15:00',
    details: { sessionId: 'abc123', loginMethod: 'password' }
  },
  {
    id: 2,
    username: 'quality_manager',
    eventType: 'create',
    description: '创建检验记录',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createTime: '2024-01-07 09:10:00',
    details: { recordId: 'INS001', productName: '产品A' }
  }
])

// 审计详情对话框
const auditDetailDialog = reactive({
  visible: false,
  data: null
})

// 安全统计
const securityStats = reactive({
  successLogins: 1256,
  failedLogins: 23,
  blockedIPs: 5,
  securityEvents: 12
})

// 安全警报
const securityAlerts = ref([
  {
    id: 1,
    level: 'high',
    title: '异常登录尝试',
    description: 'IP 192.168.1.200 在5分钟内尝试登录失败10次',
    time: '2024-01-07 09:20:00'
  },
  {
    id: 2,
    level: 'medium',
    title: '密码即将过期',
    description: '用户 test_user 的密码将在3天后过期',
    time: '2024-01-07 09:15:00'
  }
])

// 方法
const savePasswordPolicy = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('密码策略保存成功')
  }, 1000)
}

const saveSessionConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('会话配置保存成功')
  }, 1000)
}

const refreshOnlineUsers = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    ElMessage.success('在线用户数据刷新成功')
  }, 1000)
}

const forceLogout = (user) => {
  ElMessageBox.confirm(
    `确定要强制用户 "${user.username}" 下线吗？`,
    '强制下线确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`用户 ${user.username} 已强制下线`)
  })
}

const saveAccessControl = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('访问控制配置保存成功')
  }, 1000)
}

const addWhitelistIP = () => {
  accessControl.whitelist.push('')
}

const removeWhitelistIP = (index) => {
  accessControl.whitelist.splice(index, 1)
}

const addBlacklistIP = () => {
  accessControl.blacklist.push('')
}

const removeBlacklistIP = (index) => {
  accessControl.blacklist.splice(index, 1)
}

const saveAuditConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('审计日志配置保存成功')
  }, 1000)
}

const exportAuditLogs = () => {
  exporting.value = true
  setTimeout(() => {
    exporting.value = false
    ElMessage.success('审计日志导出成功')
  }, 2000)
}

const refreshAuditLogs = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    ElMessage.success('审计日志刷新成功')
  }, 1000)
}

const searchAuditLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 1000)
}

const resetAuditSearch = () => {
  Object.assign(auditSearch, {
    username: '',
    eventType: '',
    dateRange: []
  })
}

const handleAuditSizeChange = (size) => {
  auditPagination.pageSize = size
}

const handleAuditCurrentChange = (page) => {
  auditPagination.currentPage = page
}

const getEventTypeTag = (eventType) => {
  const tags = {
    login: 'success',
    logout: 'info',
    create: 'primary',
    update: 'warning',
    delete: 'danger',
    export: 'info',
    config: 'warning',
    security: 'danger'
  }
  return tags[eventType] || 'info'
}

const getEventTypeName = (eventType) => {
  const names = {
    login: '用户登录',
    logout: '用户登出',
    create: '数据创建',
    update: '数据更新',
    delete: '数据删除',
    export: '数据导出',
    config: '配置变更',
    security: '安全事件'
  }
  return names[eventType] || eventType
}

const viewAuditDetail = (row) => {
  auditDetailDialog.data = row
  auditDetailDialog.visible = true
}

const refreshSecurityAlerts = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    ElMessage.success('安全警报刷新成功')
  }, 1000)
}

const handleAlert = (alert) => {
  ElMessage.success(`安全警报 "${alert.title}" 已处理`)
}

// 生命周期
onMounted(() => {
  auditPagination.total = auditLogs.value.length
})
</script>

<style lang="scss" scoped>
.security-settings {
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

  .security-tabs {
    .config-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
          display: flex;
          gap: 12px;
        }
      }

      .config-form {
        .form-tip {
          margin-left: 8px;
          color: #909399;
          font-size: 12px;
        }

        .ip-list {
          .ip-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .el-input {
              flex: 1;
            }
          }
        }
      }

      .search-form {
        margin-bottom: 20px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .pagination-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
    }

    .security-stats {
      .stat-item {
        display: flex;
        align-items: center;
        padding: 20px;
        margin-bottom: 16px;
        background: #f8f9fa;
        border-radius: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;

          &.success {
            background: #67c23a;
          }

          &.warning {
            background: #e6a23c;
          }

          &.danger {
            background: #f56c6c;
          }

          &.info {
            background: #409eff;
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
            color: #909399;
          }
        }
      }
    }

    .security-alerts {
      max-height: 400px;
      overflow-y: auto;

      .alert-item {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        margin-bottom: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #e6a23c;

        &:last-child {
          margin-bottom: 0;
        }

        .alert-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 18px;
          color: white;

          &.high {
            background: #f56c6c;
          }

          &.medium {
            background: #e6a23c;
          }

          &.low {
            background: #409eff;
          }
        }

        .alert-content {
          flex: 1;

          .alert-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .alert-description {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
            line-height: 1.4;
          }

          .alert-time {
            font-size: 12px;
            color: #909399;
          }
        }

        .alert-actions {
          margin-left: 12px;
        }
      }

      .no-alerts {
        text-align: center;
        padding: 40px 0;
      }
    }

    .audit-detail {
      pre {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.4;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }
}

@media (max-width: 768px) {
  .security-settings {
    padding: 16px;

    .security-tabs {
      .config-card {
        .search-form {
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
      }

      .security-stats {
        .stat-item {
          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .stat-info {
            .stat-value {
              font-size: 24px;
            }
          }
        }
      }

      .security-alerts {
        .alert-item {
          .alert-icon {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
