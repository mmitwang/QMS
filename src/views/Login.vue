<template>
  <div class="login-container quality-particle-container">
    <div class="login-card quality-interactive">
      <div class="login-header">
        <div class="company-logo">
          <div class="logo-icon quality-glow">
            <el-icon size="48"><Checked /></el-icon>
          </div>
          <div class="company-info">
            <h1 class="company-name">浙江腾腾电气</h1>
            <p class="system-name">QMS质量管理系统</p>
          </div>
        </div>
      </div>
      
      <div class="login-form-container">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <div class="form-title">
            <h2>系统登录</h2>
            <p>请输入您的账号和密码</p>
          </div>
          
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button quality-inspection-effect"
              :loading="loading"
              @click="handleLogin"
            >
              <span v-if="!loading">登录系统</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="login-footer">
        <div class="quality-metrics">
          <div class="metric-item">
            <div class="metric-value excellent">99.8%</div>
            <div class="metric-label">质量合格率</div>
          </div>
          <div class="metric-item">
            <div class="metric-value good">24/7</div>
            <div class="metric-label">质量监控</div>
          </div>
          <div class="metric-item">
            <div class="metric-value warning">ISO9001</div>
            <div class="metric-label">质量认证</div>
          </div>
        </div>
        
        <div class="copyright">
          <p>&copy; 2024 浙江腾腾电气有限公司 版权所有</p>
          <p>QMS质量管理系统 v1.0.0</p>
        </div>
      </div>
    </div>
    
    <!-- 质量检测背景动画 -->
    <div class="quality-background">
      <div class="quality-circle" v-for="i in 6" :key="i" :style="getCircleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Checked, User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟登录验证
    if (loginForm.username === 'admin' && loginForm.password === '123456') {
      // 保存登录状态
      localStorage.setItem('qms_token', 'mock-jwt-token')
      localStorage.setItem('qms_user', JSON.stringify({
        id: 1,
        username: 'admin',
        name: '系统管理员',
        role: 'admin',
        department: '质量管理部'
      }))
      
      ElMessage.success('登录成功！')
      
      // 跳转到仪表盘
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } else {
      ElMessage.error('用户名或密码错误！')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请重试！')
  } finally {
    loading.value = false
  }
}

// 获取背景圆圈样式
const getCircleStyle = (index) => {
  const positions = [
    { top: '10%', left: '15%', size: '120px', delay: '0s' },
    { top: '20%', right: '10%', size: '80px', delay: '1s' },
    { top: '60%', left: '8%', size: '100px', delay: '2s' },
    { bottom: '15%', right: '20%', size: '150px', delay: '0.5s' },
    { bottom: '30%', left: '25%', size: '60px', delay: '1.5s' },
    { top: '45%', right: '35%', size: '90px', delay: '2.5s' }
  ]
  
  const pos = positions[index - 1]
  return {
    ...pos,
    width: pos.size,
    height: pos.size,
    animationDelay: pos.delay
  }
}

onMounted(() => {
  // 检查是否已登录
  const token = localStorage.getItem('qms_token')
  if (token) {
    router.push('/dashboard')
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  position: relative;
  overflow: hidden;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: $border-radius-large;
  box-shadow: $shadow-heavy;
  width: 100%;
  max-width: 420px;
  padding: $spacing-xl;
  position: relative;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: $quality-gradient;
    border-radius: $border-radius-large $border-radius-large 0 0;
  }
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  .company-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    
    .logo-icon {
      width: 80px;
      height: 80px;
      background: $quality-gradient;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: $spacing-sm;
    }
    
    .company-info {
      .company-name {
        font-size: $font-size-xxl;
        font-weight: 700;
        color: $text-primary;
        margin: 0 0 $spacing-xs 0;
        background: $quality-gradient;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .system-name {
        font-size: $font-size-md;
        color: $text-secondary;
        margin: 0;
      }
    }
  }
}

.login-form-container {
  .form-title {
    text-align: center;
    margin-bottom: $spacing-xl;
    
    h2 {
      font-size: $font-size-xl;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }
    
    p {
      color: $text-secondary;
      margin: 0;
    }
  }
  
  .login-form {
    .el-form-item {
      margin-bottom: $spacing-lg;
    }
    
    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .login-button {
      width: 100%;
      height: 48px;
      font-size: $font-size-md;
      font-weight: 600;
      background: $primary-gradient;
      border: none;
      
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    }
  }
}

.login-footer {
  margin-top: $spacing-xl;
  
  .quality-metrics {
    display: flex;
    justify-content: space-around;
    margin-bottom: $spacing-lg;
    padding: $spacing-md 0;
    border-top: 1px solid $border-light;
    
    .metric-item {
      text-align: center;
      
      .metric-value {
        font-size: $font-size-lg;
        font-weight: 700;
        margin-bottom: $spacing-xs;
        
        &.excellent { color: $quality-excellent; }
        &.good { color: $quality-good; }
        &.warning { color: $quality-warning; }
      }
      
      .metric-label {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }
  }
  
  .copyright {
    text-align: center;
    color: $text-disabled;
    font-size: $font-size-xs;
    
    p {
      margin: $spacing-xs 0;
    }
  }
}

.quality-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  
  .quality-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: qualityFloat 6s ease-in-out infinite;
    
    &:nth-child(odd) {
      animation-direction: reverse;
    }
  }
}

@keyframes qualityFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: $spacing-md;
  }
  
  .login-card {
    padding: $spacing-lg;
    
    .login-header {
      .company-logo {
        .logo-icon {
          width: 60px;
          height: 60px;
        }
        
        .company-info {
          .company-name {
            font-size: $font-size-xl;
          }
        }
      }
    }
    
    .quality-metrics {
      flex-direction: column;
      gap: $spacing-sm;
      
      .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .metric-value,
        .metric-label {
          margin: 0;
        }
      }
    }
  }
}
</style>
