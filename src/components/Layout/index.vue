<template>
  <div class="qms-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="logo-container">
        <div class="logo">
          <div class="logo-icon">
            <i class="el-icon-medal"></i>
          </div>
          <span v-show="!isCollapse" class="logo-text">QMS质量管理</span>
        </div>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        class="sidebar-menu"
        background-color="#2c3e50"
        text-color="#bdc3c7"
        active-text-color="#3498db"
        router
      >
        <el-menu-item index="/dashboard">
          <i class="el-icon-data-board"></i>
          <span slot="title">质量仪表盘</span>
        </el-menu-item>

        <el-submenu index="inspection">
          <template slot="title">
            <i class="el-icon-view"></i>
            <span>质量检验</span>
          </template>
          <el-menu-item index="/inspection/incoming">来料检验</el-menu-item>
          <el-menu-item index="/inspection/process">过程检验</el-menu-item>
          <el-menu-item index="/inspection/final">成品检验</el-menu-item>
          <el-menu-item index="/inspection/outgoing">出厂检验</el-menu-item>
        </el-submenu>

        <el-submenu index="quality-control">
          <template slot="title">
            <i class="el-icon-setting"></i>
            <span>质量控制</span>
          </template>
          <el-menu-item index="/quality-control/spc">SPC统计控制</el-menu-item>
        </el-submenu>

        <el-submenu index="quality-analysis">
          <template slot="title">
            <i class="el-icon-data-analysis"></i>
            <span>质量分析</span>
          </template>
          <el-menu-item index="/quality-analysis/trend">趋势分析</el-menu-item>
          <el-menu-item index="/quality-analysis/pareto">帕累托分析</el-menu-item>
          <el-menu-item index="/quality-analysis/fishbone">鱼骨图分析</el-menu-item>
          <el-menu-item index="/quality-analysis/capability">能力分析</el-menu-item>
        </el-submenu>

        <el-submenu index="non-conforming">
          <template slot="title">
            <i class="el-icon-warning"></i>
            <span>不合格品管理</span>
          </template>
          <el-menu-item index="/non-conforming/management">不合格品管理</el-menu-item>
        </el-submenu>

        <el-submenu index="supplier">
          <template slot="title">
            <i class="el-icon-truck"></i>
            <span>供应商质量管理</span>
          </template>
          <el-menu-item index="/supplier/quality">供应商质量管理</el-menu-item>
        </el-submenu>

        <el-submenu index="document">
          <template slot="title">
            <i class="el-icon-document"></i>
            <span>文档管理</span>
          </template>
          <el-menu-item index="/document/standard">质量标准</el-menu-item>
          <el-menu-item index="/document/procedure">作业程序</el-menu-item>
          <el-menu-item index="/document/record">质量记录</el-menu-item>
          <el-menu-item index="/document/manual">质量手册</el-menu-item>
        </el-submenu>

        <el-submenu index="reports">
          <template slot="title">
            <i class="el-icon-s-data"></i>
            <span>报表管理</span>
          </template>
          <el-menu-item index="/reports/management">报表管理</el-menu-item>
        </el-submenu>

        <el-submenu index="settings">
          <template slot="title">
            <i class="el-icon-tools"></i>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/settings/user">用户管理</el-menu-item>
          <el-menu-item index="/settings/role">角色权限</el-menu-item>
          <el-menu-item index="/settings/system">系统配置</el-menu-item>
          <el-menu-item index="/settings/security">安全设置</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleSidebar"
            class="collapse-btn"
          >
            <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
          </el-button>
          
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 质量指标快速显示 -->
          <div class="quality-indicators">
            <div class="indicator-item">
              <span class="indicator-label">合格率</span>
              <span class="indicator-value success">98.5%</span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">检验中</span>
              <span class="indicator-value warning">12</span>
            </div>
          </div>

          <!-- 通知中心 -->
          <el-dropdown @command="handleNotification" class="notification-dropdown">
            <el-badge :value="notificationCount" :hidden="notificationCount === 0">
              <el-button type="text" class="notification-btn">
                <i class="el-icon-bell"></i>
              </el-button>
            </el-badge>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item 
                v-for="(notification, index) in notifications" 
                :key="index"
                :command="notification"
                :class="notification.type"
              >
                <div class="notification-item">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-time">{{ notification.time }}</div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="viewAll">
                查看全部通知
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 用户菜单 -->
          <el-dropdown @command="handleUserMenu" class="user-dropdown">
            <div class="user-info">
              <div class="user-avatar">
                <i class="el-icon-user"></i>
              </div>
              <span class="user-name">质量管理员</span>
              <i class="el-icon-arrow-down"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <transition name="fade-transform" mode="out-in">
          <router-view />
        </transition>
      </el-main>
    </el-container>

    <!-- 质量检测背景效果 -->
    <div class="quality-effects-container" ref="qualityEffects"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'QMSLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isCollapse = ref(false)
    const qualityEffects = ref(null)
    let qualityEffectsInstance = null

    // 通知数据
    const notifications = ref([
      {
        title: '温度异常预警',
        time: '2分钟前',
        type: 'warning'
      },
      {
        title: '检验任务完成',
        time: '5分钟前',
        type: 'success'
      },
      {
        title: '质量报告生成',
        time: '10分钟前',
        type: 'info'
      }
    ])

    const notificationCount = computed(() => notifications.value.length)

    // 当前激活的菜单
    const activeMenu = computed(() => route.path)

    // 面包屑导航
    const breadcrumbList = computed(() => {
      const pathArray = route.path.split('/').filter(item => item)
      const breadcrumbs = []
      
      const menuMap = {
        'dashboard': '质量仪表盘',
        'inspection': '质量检验',
        'incoming': '来料检验',
        'process': '过程检验',
        'final': '成品检验',
        'outgoing': '出厂检验',
        'control': '质量控制',
        'spc': 'SPC统计控制',
        'prevention': '预防控制',
        'analysis': '质量分析',
        'trend': '趋势分析',
        'pareto': '帕累托分析',
        'fishbone': '鱼骨图分析',
        'capability': '能力分析',
        'nonconformance': '不合格品管理',
        'record': '不合格记录',
        'handling': '处理流程',
        'corrective': '纠正措施',
        'preventive': '预防措施',
        'supplier': '供应商质量管理',
        'evaluation': '供应商评价',
        'audit': '供应商审核',
        'performance': '绩效管理',
        'improvement': '改进计划',
        'document': '文档管理',
        'standard': '质量标准',
        'procedure': '作业程序',
        'manual': '质量手册',
        'settings': '系统设置',
        'user': '用户管理',
        'role': '角色权限',
        'system': '系统配置',
        'security': '安全设置'
      }

      pathArray.forEach((path, index) => {
        if (menuMap[path]) {
          breadcrumbs.push({
            title: menuMap[path],
            path: '/' + pathArray.slice(0, index + 1).join('/')
          })
        }
      })

      return breadcrumbs
    })

    // 切换侧边栏
    const toggleSidebar = () => {
      isCollapse.value = !isCollapse.value
    }

    // 处理通知点击
    const handleNotification = (notification) => {
      if (notification === 'viewAll') {
        console.log('查看全部通知')
        return
      }
      console.log('点击通知:', notification)
    }

    // 处理用户菜单
    const handleUserMenu = (command) => {
      switch (command) {
        case 'profile':
          console.log('个人资料')
          break
        case 'settings':
          router.push('/settings/system')
          break
        case 'logout':
          router.push('/login')
          break
      }
    }

    // 初始化质量检测特效
    const initQualityEffects = () => {
      if (qualityEffects.value) {
        // 简单的背景特效，不依赖外部文件
        qualityEffects.value.style.background = `
          linear-gradient(45deg, 
            rgba(24, 144, 255, 0.05) 0%, 
            rgba(82, 196, 26, 0.05) 50%, 
            rgba(114, 46, 209, 0.05) 100%
          )
        `
        qualityEffects.value.style.animation = 'qualityGlow 8s ease-in-out infinite'
      }
    }

    onMounted(() => {
      setTimeout(() => {
        initQualityEffects()
      }, 1000)
    })

    onUnmounted(() => {
      // 清理动画
      if (qualityEffects.value) {
        qualityEffects.value.style.animation = 'none'
      }
    })

    return {
      isCollapse,
      activeMenu,
      breadcrumbList,
      notifications,
      notificationCount,
      qualityEffects,
      toggleSidebar,
      handleNotification,
      handleUserMenu
    }
  }
}
</script>

<style lang="scss" scoped>
.qms-layout {
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;

  .sidebar {
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transition: width 0.3s ease;
    z-index: 1001;

    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #34495e;
      margin-bottom: 10px;

        .logo {
          display: flex;
          align-items: center;
          color: #ecf0f1;

          .logo-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #3498db, #2980b9);
            border-radius: 50%;
            margin-right: 10px;
            
            i {
              font-size: 18px;
              color: white;
            }
          }

          .logo-text {
            font-size: 16px;
            font-weight: bold;
            white-space: nowrap;
          }
        }
    }

    .sidebar-menu {
      border: none;
      height: calc(100vh - 70px);
      overflow-y: auto;

      &:not(.el-menu--collapse) {
        width: 240px;
      }

      .el-menu-item {
        &:hover {
          background-color: #34495e !important;
        }

        &.is-active {
          background-color: #3498db !important;
          border-right: 3px solid #2980b9;
        }
      }

      .el-submenu {
        .el-submenu__title {
          &:hover {
            background-color: #34495e !important;
          }
        }

        .el-menu {
          background-color: #2c3e50;

          .el-menu-item {
            background-color: #2c3e50 !important;
            padding-left: 50px !important;

            &:hover {
              background-color: #34495e !important;
            }

            &.is-active {
              background-color: #3498db !important;
            }
          }
        }
      }
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;

    .header {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 1000;

      .header-left {
        display: flex;
        align-items: center;

        .collapse-btn {
          font-size: 18px;
          margin-right: 20px;
          color: #606266;

          &:hover {
            color: #409EFF;
          }
        }

        .breadcrumb {
          font-size: 14px;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 20px;

        .quality-indicators {
          display: flex;
          gap: 15px;

          .indicator-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5px 10px;
            background: #f8f9fa;
            border-radius: 6px;
            min-width: 60px;

            .indicator-label {
              font-size: 11px;
              color: #909399;
              margin-bottom: 2px;
            }

            .indicator-value {
              font-size: 14px;
              font-weight: bold;

              &.success {
                color: #67C23A;
              }

              &.warning {
                color: #E6A23C;
              }

              &.danger {
                color: #F56C6C;
              }
            }
          }
        }

        .notification-dropdown {
          .notification-btn {
            font-size: 18px;
            color: #606266;

            &:hover {
              color: #409EFF;
            }
          }

          .notification-item {
            .notification-title {
              font-size: 13px;
              color: #303133;
              margin-bottom: 2px;
            }

            .notification-time {
              font-size: 11px;
              color: #C0C4CC;
            }
          }
        }

        .user-dropdown {
          .user-info {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 6px;
            transition: all 0.3s ease;

            &:hover {
              background-color: #f8f9fa;
            }

            .user-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              margin-right: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #e74c3c, #c0392b);
              
              i {
                font-size: 16px;
                color: white;
              }
            }

            .user-name {
              font-size: 14px;
              color: #303133;
              margin-right: 5px;
            }

            i {
              font-size: 12px;
              color: #C0C4CC;
            }
          }
        }
      }
    }

    .main-content {
      flex: 1;
      padding: 0;
      overflow-y: auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
  }

  .quality-effects-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.3;
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 响应式设计
@media (max-width: 768px) {
  .qms-layout {
    .sidebar {
      position: fixed;
      height: 100vh;
      z-index: 2000;
    }

    .main-container {
      margin-left: 0;

      .header {
        .header-right {
          .quality-indicators {
            display: none;
          }
        }
      }
    }
  }
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;

  &:hover {
    background: #a8a8a8;
  }
}
</style>
