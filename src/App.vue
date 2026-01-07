<template>
  <div id="app" class="qms-container">
    <router-view />
  </div>
</template>

<script>
import { qualityEffects } from './utils/qualityEffects.js'

export default {
  name: 'App',
  mounted() {
    // 初始化质量检测特效
    this.$nextTick(() => {
      qualityEffects.init()
    })
  },
  beforeUnmount() {
    // 清理质量特效资源
    qualityEffects.destroy()
  }
}
</script>

<style lang="scss">
@import './styles/index.scss';

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $text-primary;
  background: $bg-primary;
  min-height: 100vh;
}

// 质量管理系统专用样式
.qms-app {
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(24, 144, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(114, 46, 209, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(19, 194, 194, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }
}

// 全局滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: $bg-secondary;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: $border-color;
  border-radius: 4px;
  transition: background $transition-medium ease;
  
  &:hover {
    background: $primary-color;
  }
}

// 质量管理专用过渡动画
.quality-fade-enter-active,
.quality-fade-leave-active {
  transition: all $transition-medium ease;
}

.quality-fade-enter-from,
.quality-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.quality-slide-enter-active,
.quality-slide-leave-active {
  transition: all $transition-medium ease;
}

.quality-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.quality-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// 质量检测加载动画
.quality-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $border-light;
    border-top: 3px solid $primary-color;
    border-radius: 50%;
    animation: qualitySpinner 1s linear infinite;
  }
  
  .loading-text {
    margin-left: $spacing-md;
    color: $text-secondary;
    font-size: $font-size-md;
  }
}

@keyframes qualitySpinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式布局
@media (max-width: 1200px) {
  .qms-container {
    padding: 0 $spacing-md;
  }
}

@media (max-width: 768px) {
  .qms-container {
    padding: 0 $spacing-sm;
  }
}

@media (max-width: 480px) {
  .qms-container {
    padding: 0 $spacing-xs;
  }
}
</style>
