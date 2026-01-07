<template>
  <div class="error-container quality-particle-container">
    <div class="error-content">
      <div class="error-animation">
        <div class="error-icon quality-glow">
          <el-icon size="120"><Warning /></el-icon>
        </div>
        <div class="error-circles">
          <div class="circle" v-for="i in 3" :key="i" :style="getCircleStyle(i)"></div>
        </div>
      </div>
      
      <div class="error-info">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除。<br>
          请检查URL是否正确，或返回首页继续浏览。
        </p>
        
        <div class="error-actions">
          <el-button 
            type="primary" 
            size="large"
            class="quality-inspection-effect"
            @click="goHome"
          >
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          
          <el-button 
            size="large"
            @click="goBack"
          >
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="error-footer">
      <div class="quality-tips">
        <h3>质量管理提示</h3>
        <div class="tips-grid">
          <div class="tip-item">
            <el-icon><Checked /></el-icon>
            <span>确保URL路径正确</span>
          </div>
          <div class="tip-item">
            <el-icon><Monitor /></el-icon>
            <span>检查系统访问权限</span>
          </div>
          <div class="tip-item">
            <el-icon><Setting /></el-icon>
            <span>联系系统管理员</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Warning, House, Back, Checked, Monitor, Setting } from '@element-plus/icons-vue'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/dashboard')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 获取圆圈样式
const getCircleStyle = (index) => {
  const delays = ['0s', '0.5s', '1s']
  const sizes = ['60px', '80px', '100px']
  
  return {
    width: sizes[index - 1],
    height: sizes[index - 1],
    animationDelay: delays[index - 1]
  }
}
</script>

<style lang="scss" scoped>
.error-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  position: relative;
  overflow: hidden;
}

.error-content {
  text-align: center;
  max-width: 600px;
  margin-bottom: $spacing-xl;
}

.error-animation {
  position: relative;
  margin-bottom: $spacing-xl;
  
  .error-icon {
    color: $warning-color;
    margin-bottom: $spacing-lg;
    display: inline-block;
  }
  
  .error-circles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    
    .circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(250, 173, 20, 0.3);
      border-radius: 50%;
      animation: errorPulse 2s ease-in-out infinite;
    }
  }
}

.error-info {
  .error-code {
    font-size: 6rem;
    font-weight: 700;
    color: $primary-color;
    margin: 0 0 $spacing-md 0;
    background: $quality-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .error-title {
    font-size: $font-size-xxl;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
  }
  
  .error-description {
    font-size: $font-size-md;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0 0 $spacing-xl 0;
  }
  
  .error-actions {
    display: flex;
    gap: $spacing-md;
    justify-content: center;
    flex-wrap: wrap;
    
    .el-button {
      padding: $spacing-md $spacing-lg;
      font-size: $font-size-md;
      border-radius: $border-radius-medium;
      
      &.quality-inspection-effect {
        background: $primary-gradient;
        border: none;
        
        &:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      }
    }
  }
}

.error-footer {
  .quality-tips {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: $border-radius-large;
    padding: $spacing-lg;
    box-shadow: $shadow-light;
    
    h3 {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 $spacing-md 0;
      text-align: center;
    }
    
    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: $spacing-md;
      
      .tip-item {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-sm;
        background: rgba(24, 144, 255, 0.05);
        border-radius: $border-radius-medium;
        color: $text-secondary;
        font-size: $font-size-sm;
        
        .el-icon {
          color: $primary-color;
          font-size: $font-size-md;
        }
      }
    }
  }
}

@keyframes errorPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .error-container {
    padding: $spacing-lg;
  }
  
  .error-info {
    .error-code {
      font-size: 4rem;
    }
    
    .error-title {
      font-size: $font-size-xl;
    }
    
    .error-actions {
      flex-direction: column;
      align-items: center;
      
      .el-button {
        width: 100%;
        max-width: 200px;
      }
    }
  }
  
  .error-footer {
    .quality-tips {
      .tips-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
