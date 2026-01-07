<template>
  <div class="system-settings">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>系统配置</h2>
      <p>管理系统基础配置、参数设置和功能开关</p>
    </div>

    <!-- 配置标签页 -->
    <el-tabs v-model="activeTab" class="config-tabs">
      <!-- 基础配置 -->
      <el-tab-pane label="基础配置" name="basic">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>系统基础信息</span>
              <el-button type="primary" @click="saveBasicConfig" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="basicConfig" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="系统名称">
                  <el-input v-model="basicConfig.systemName" placeholder="请输入系统名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统版本">
                  <el-input v-model="basicConfig.systemVersion" placeholder="请输入系统版本" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="公司名称">
                  <el-input v-model="basicConfig.companyName" placeholder="请输入公司名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="basicConfig.contactPhone" placeholder="请输入联系电话" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="系统Logo">
                  <el-upload
                    class="logo-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeLogoUpload"
                    :http-request="handleLogoUpload"
                  >
                    <img v-if="basicConfig.logoUrl" :src="basicConfig.logoUrl" class="logo" />
                    <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统描述">
                  <el-input
                    v-model="basicConfig.systemDescription"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入系统描述"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="时区设置">
                  <el-select v-model="basicConfig.timezone" placeholder="请选择时区" style="width: 100%">
                    <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                    <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                    <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                    <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="语言设置">
                  <el-select v-model="basicConfig.language" placeholder="请选择语言" style="width: 100%">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="繁体中文" value="zh-TW" />
                    <el-option label="English" value="en-US" />
                    <el-option label="日本語" value="ja-JP" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 功能配置 -->
      <el-tab-pane label="功能配置" name="feature">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>功能模块开关</span>
              <el-button type="primary" @click="saveFeatureConfig" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
            </div>
          </template>
          
          <div class="feature-config">
            <el-row :gutter="20">
              <el-col :span="8" v-for="module in featureModules" :key="module.key">
                <el-card class="feature-card" :class="{ active: module.enabled }">
                  <div class="feature-header">
                    <div class="feature-icon">
                      <el-icon><component :is="module.icon" /></el-icon>
                    </div>
                    <div class="feature-info">
                      <h4>{{ module.name }}</h4>
                      <p>{{ module.description }}</p>
                    </div>
                    <el-switch
                      v-model="module.enabled"
                      @change="handleFeatureToggle(module)"
                    />
                  </div>
                  
                  <div class="feature-options" v-if="module.enabled && module.options">
                    <el-divider />
                    <div class="option-item" v-for="option in module.options" :key="option.key">
                      <span>{{ option.label }}</span>
                      <el-switch v-model="option.value" size="small" />
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 邮件配置 -->
      <el-tab-pane label="邮件配置" name="email">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>邮件服务配置</span>
              <div class="header-actions">
                <el-button @click="testEmailConfig" :loading="testing">
                  <el-icon><Message /></el-icon>
                  测试连接
                </el-button>
                <el-button type="primary" @click="saveEmailConfig" :loading="saving">
                  <el-icon><Check /></el-icon>
                  保存配置
                </el-button>
              </div>
            </div>
          </template>
          
          <el-form :model="emailConfig" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="SMTP服务器">
                  <el-input v-model="emailConfig.smtpHost" placeholder="请输入SMTP服务器地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="SMTP端口">
                  <el-input-number v-model="emailConfig.smtpPort" :min="1" :max="65535" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="发送邮箱">
                  <el-input v-model="emailConfig.fromEmail" placeholder="请输入发送邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱密码">
                  <el-input
                    v-model="emailConfig.password"
                    type="password"
                    placeholder="请输入邮箱密码或授权码"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="发送人名称">
                  <el-input v-model="emailConfig.fromName" placeholder="请输入发送人名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="加密方式">
                  <el-select v-model="emailConfig.encryption" placeholder="请选择加密方式" style="width: 100%">
                    <el-option label="无加密" value="none" />
                    <el-option label="SSL" value="ssl" />
                    <el-option label="TLS" value="tls" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="启用邮件服务">
              <el-switch v-model="emailConfig.enabled" />
              <span class="form-tip">启用后系统将通过邮件发送通知</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 存储配置 -->
      <el-tab-pane label="存储配置" name="storage">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>文件存储配置</span>
              <el-button type="primary" @click="saveStorageConfig" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="storageConfig" label-width="150px" class="config-form">
            <el-form-item label="存储方式">
              <el-radio-group v-model="storageConfig.type">
                <el-radio label="local">本地存储</el-radio>
                <el-radio label="oss">阿里云OSS</el-radio>
                <el-radio label="cos">腾讯云COS</el-radio>
                <el-radio label="qiniu">七牛云</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <!-- 本地存储配置 -->
            <template v-if="storageConfig.type === 'local'">
              <el-form-item label="存储路径">
                <el-input v-model="storageConfig.local.path" placeholder="请输入存储路径" />
              </el-form-item>
              <el-form-item label="访问域名">
                <el-input v-model="storageConfig.local.domain" placeholder="请输入访问域名" />
              </el-form-item>
            </template>
            
            <!-- 阿里云OSS配置 -->
            <template v-if="storageConfig.type === 'oss'">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="AccessKey ID">
                    <el-input v-model="storageConfig.oss.accessKeyId" placeholder="请输入AccessKey ID" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="AccessKey Secret">
                    <el-input
                      v-model="storageConfig.oss.accessKeySecret"
                      type="password"
                      placeholder="请输入AccessKey Secret"
                      show-password
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Bucket名称">
                    <el-input v-model="storageConfig.oss.bucket" placeholder="请输入Bucket名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="地域节点">
                    <el-select v-model="storageConfig.oss.region" placeholder="请选择地域节点" style="width: 100%">
                      <el-option label="华东1（杭州）" value="oss-cn-hangzhou" />
                      <el-option label="华东2（上海）" value="oss-cn-shanghai" />
                      <el-option label="华北1（青岛）" value="oss-cn-qingdao" />
                      <el-option label="华北2（北京）" value="oss-cn-beijing" />
                      <el-option label="华南1（深圳）" value="oss-cn-shenzhen" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
            
            <el-form-item label="最大文件大小">
              <el-input-number
                v-model="storageConfig.maxFileSize"
                :min="1"
                :max="1024"
                style="width: 200px"
              />
              <span class="form-tip">MB</span>
            </el-form-item>
            
            <el-form-item label="允许的文件类型">
              <el-select
                v-model="storageConfig.allowedTypes"
                multiple
                placeholder="请选择允许的文件类型"
                style="width: 100%"
              >
                <el-option label="图片文件 (jpg, png, gif)" value="image" />
                <el-option label="文档文件 (pdf, doc, docx)" value="document" />
                <el-option label="表格文件 (xls, xlsx, csv)" value="spreadsheet" />
                <el-option label="压缩文件 (zip, rar, 7z)" value="archive" />
                <el-option label="视频文件 (mp4, avi, mov)" value="video" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 系统监控 -->
      <el-tab-pane label="系统监控" name="monitor">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>系统运行状态</span>
              <el-button @click="refreshMonitorData" :loading="refreshing">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </div>
          </template>
          
          <div class="monitor-content">
            <!-- 系统信息 -->
            <div class="monitor-section">
              <h4>系统信息</h4>
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="monitor-item">
                    <div class="monitor-label">操作系统</div>
                    <div class="monitor-value">{{ systemInfo.os }}</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="monitor-item">
                    <div class="monitor-label">CPU架构</div>
                    <div class="monitor-value">{{ systemInfo.arch }}</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="monitor-item">
                    <div class="monitor-label">Node.js版本</div>
                    <div class="monitor-value">{{ systemInfo.nodeVersion }}</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="monitor-item">
                    <div class="monitor-label">运行时间</div>
                    <div class="monitor-value">{{ systemInfo.uptime }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <!-- 资源使用情况 -->
            <div class="monitor-section">
              <h4>资源使用情况</h4>
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="resource-card">
                    <div class="resource-header">
                      <span>CPU使用率</span>
                      <span class="resource-value">{{ resourceUsage.cpu }}%</span>
                    </div>
                    <el-progress :percentage="resourceUsage.cpu" :color="getProgressColor(resourceUsage.cpu)" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="resource-card">
                    <div class="resource-header">
                      <span>内存使用率</span>
                      <span class="resource-value">{{ resourceUsage.memory }}%</span>
                    </div>
                    <el-progress :percentage="resourceUsage.memory" :color="getProgressColor(resourceUsage.memory)" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="resource-card">
                    <div class="resource-header">
                      <span>磁盘使用率</span>
                      <span class="resource-value">{{ resourceUsage.disk }}%</span>
                    </div>
                    <el-progress :percentage="resourceUsage.disk" :color="getProgressColor(resourceUsage.disk)" />
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <!-- 数据库状态 -->
            <div class="monitor-section">
              <h4>数据库状态</h4>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="db-status">
                    <div class="status-item">
                      <span class="status-label">连接状态</span>
                      <el-tag :type="dbStatus.connected ? 'success' : 'danger'">
                        {{ dbStatus.connected ? '已连接' : '未连接' }}
                      </el-tag>
                    </div>
                    <div class="status-item">
                      <span class="status-label">数据库版本</span>
                      <span class="status-value">{{ dbStatus.version }}</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">活跃连接数</span>
                      <span class="status-value">{{ dbStatus.activeConnections }}</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="db-stats">
                    <div class="stat-item">
                      <span class="stat-label">总查询数</span>
                      <span class="stat-value">{{ dbStatus.totalQueries }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">慢查询数</span>
                      <span class="stat-value">{{ dbStatus.slowQueries }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">数据库大小</span>
                      <span class="stat-value">{{ dbStatus.dbSize }}</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Check,
  Plus,
  Message,
  Refresh,
  Setting,
  Bell,
  Document,
  DataAnalysis,
  User,
  Lock
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('basic')
const saving = ref(false)
const testing = ref(false)
const refreshing = ref(false)

// 基础配置
const basicConfig = reactive({
  systemName: 'QMS质量管理系统',
  systemVersion: 'v1.0.0',
  companyName: '某某制造有限公司',
  contactPhone: '400-123-4567',
  logoUrl: '',
  systemDescription: '专业的质量管理系统，提供全面的质量控制和管理解决方案',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN'
})

// 功能模块配置
const featureModules = ref([
  {
    key: 'inspection',
    name: '检验管理',
    description: '来料、过程、成品、出厂检验',
    icon: 'Document',
    enabled: true,
    options: [
      { key: 'autoApproval', label: '自动审批', value: false },
      { key: 'batchProcess', label: '批量处理', value: true }
    ]
  },
  {
    key: 'qualityControl',
    name: '质量控制',
    description: 'SPC控制、质量预警',
    icon: 'DataAnalysis',
    enabled: true,
    options: [
      { key: 'realTimeMonitor', label: '实时监控', value: true },
      { key: 'autoAlert', label: '自动预警', value: true }
    ]
  },
  {
    key: 'analysis',
    name: '质量分析',
    description: '趋势分析、帕累托分析等',
    icon: 'DataAnalysis',
    enabled: true,
    options: [
      { key: 'autoReport', label: '自动报告', value: false },
      { key: 'exportData', label: '数据导出', value: true }
    ]
  },
  {
    key: 'nonconforming',
    name: '不合格品管理',
    description: '不合格品处理、纠正预防',
    icon: 'Bell',
    enabled: true,
    options: [
      { key: 'autoNotify', label: '自动通知', value: true },
      { key: 'trackProcess', label: '过程跟踪', value: true }
    ]
  },
  {
    key: 'supplier',
    name: '供应商管理',
    description: '供应商质量评估管理',
    icon: 'User',
    enabled: true,
    options: [
      { key: 'periodicEval', label: '定期评估', value: true },
      { key: 'riskWarning', label: '风险预警', value: false }
    ]
  },
  {
    key: 'document',
    name: '文档管理',
    description: '质量标准、程序文档管理',
    icon: 'Document',
    enabled: true,
    options: [
      { key: 'versionControl', label: '版本控制', value: true },
      { key: 'approvalFlow', label: '审批流程', value: true }
    ]
  }
])

// 邮件配置
const emailConfig = reactive({
  enabled: false,
  smtpHost: 'smtp.qq.com',
  smtpPort: 587,
  fromEmail: '',
  password: '',
  fromName: 'QMS系统',
  encryption: 'tls'
})

// 存储配置
const storageConfig = reactive({
  type: 'local',
  maxFileSize: 10,
  allowedTypes: ['image', 'document'],
  local: {
    path: '/uploads',
    domain: 'http://localhost:3000'
  },
  oss: {
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    region: 'oss-cn-hangzhou'
  }
})

// 系统信息
const systemInfo = reactive({
  os: 'Windows 11',
  arch: 'x64',
  nodeVersion: 'v18.17.0',
  uptime: '2天 5小时 32分钟'
})

// 资源使用情况
const resourceUsage = reactive({
  cpu: 35,
  memory: 68,
  disk: 45
})

// 数据库状态
const dbStatus = reactive({
  connected: true,
  version: 'MySQL 8.0.33',
  activeConnections: 12,
  totalQueries: 156789,
  slowQueries: 23,
  dbSize: '2.3 GB'
})

// 方法
const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleLogoUpload = (options) => {
  // 模拟上传
  const reader = new FileReader()
  reader.onload = (e) => {
    basicConfig.logoUrl = e.target.result
  }
  reader.readAsDataURL(options.file)
}

const saveBasicConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('基础配置保存成功')
  }, 1000)
}

const handleFeatureToggle = (module) => {
  ElMessage.success(`${module.name} 已${module.enabled ? '启用' : '禁用'}`)
}

const saveFeatureConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('功能配置保存成功')
  }, 1000)
}

const testEmailConfig = () => {
  testing.value = true
  setTimeout(() => {
    testing.value = false
    ElMessage.success('邮件服务连接测试成功')
  }, 2000)
}

const saveEmailConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('邮件配置保存成功')
  }, 1000)
}

const saveStorageConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('存储配置保存成功')
  }, 1000)
}

const refreshMonitorData = () => {
  refreshing.value = true
  setTimeout(() => {
    // 模拟数据更新
    resourceUsage.cpu = Math.floor(Math.random() * 100)
    resourceUsage.memory = Math.floor(Math.random() * 100)
    resourceUsage.disk = Math.floor(Math.random() * 100)
    refreshing.value = false
    ElMessage.success('监控数据刷新成功')
  }, 1000)
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.system-settings {
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

  .config-tabs {
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
      }
    }

    .logo-uploader {
      .logo {
        width: 100px;
        height: 100px;
        object-fit: contain;
        border-radius: 8px;
      }

      .logo-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }
      }
    }

    .feature-config {
      .feature-card {
        margin-bottom: 20px;
        transition: all 0.3s;

        &.active {
          border-color: #409eff;
          box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
        }

        .feature-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;

          .feature-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f7fa;
            color: #409eff;
            font-size: 18px;
            flex-shrink: 0;
          }

          .feature-info {
            flex: 1;

            h4 {
              margin: 0 0 4px 0;
              color: #303133;
              font-size: 16px;
              font-weight: 600;
            }

            p {
              margin: 0;
              color: #909399;
              font-size: 12px;
              line-height: 1.4;
            }
          }
        }

        .feature-options {
          .option-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            span {
              font-size: 14px;
              color: #606266;
            }
          }
        }
      }
    }

    .monitor-content {
      .monitor-section {
        margin-bottom: 30px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 16px 0;
          color: #303133;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 1px solid #ebeef5;
          padding-bottom: 8px;
        }

        .monitor-item {
          text-align: center;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;

          .monitor-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
          }

          .monitor-value {
            font-size: 16px;
            color: #303133;
            font-weight: 600;
          }
        }

        .resource-card {
          padding: 20px;
          background: #fff;
          border: 1px solid #ebeef5;
          border-radius: 8px;

          .resource-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            span {
              font-size: 14px;
              color: #606266;
            }

            .resource-value {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }
          }
        }

        .db-status,
        .db-stats {
          .status-item,
          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f5f7fa;

            &:last-child {
              border-bottom: none;
            }

            .status-label,
            .stat-label {
              font-size: 14px;
              color: #606266;
            }

            .status-value,
            .stat-value {
              font-size: 14px;
              color: #303133;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .system-settings {
    padding: 16px;

    .config-tabs {
      .feature-config {
        .el-col {
          margin-bottom: 16px;
        }
      }

      .monitor-content {
        .monitor-section {
          .el-col {
            margin-bottom: 16px;
          }
        }
      }
    }
  }
}
</style>
