import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'

// 导入质量检测特效
import { qualityEffects } from './utils/qualityEffects.js'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { title: '登录 - QMS质量管理系统' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./components/Layout/index.vue'),
    meta: { title: '仪表盘 - QMS质量管理系统', requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('./views/Dashboard.vue')
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('./views/404.vue'),
    meta: { title: '页面未找到 - QMS质量管理系统' }
  },
  
  // 质量检验模块
  {
    path: '/inspection',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'incoming',
        name: 'IncomingInspection',
        component: () => import('./views/Inspection/Incoming.vue'),
        meta: { title: '来料检验 - QMS质量管理系统' }
      },
      {
        path: 'process',
        name: 'ProcessInspection',
        component: () => import('./views/Inspection/Process.vue'),
        meta: { title: '过程检验 - QMS质量管理系统' }
      },
      {
        path: 'final',
        name: 'FinalInspection',
        component: () => import('./views/Inspection/Final.vue'),
        meta: { title: '成品检验 - QMS质量管理系统' }
      },
      {
        path: 'outgoing',
        name: 'OutgoingInspection',
        component: () => import('./views/Inspection/Outgoing.vue'),
        meta: { title: '出厂检验 - QMS质量管理系统' }
      }
    ]
  },
  
  // 质量控制模块
  {
    path: '/quality-control',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'spc',
        name: 'SPCControl',
        component: () => import('./views/QualityControl/SPC.vue'),
        meta: { title: 'SPC统计控制 - QMS质量管理系统' }
      }
    ]
  },
  
  // 质量分析模块
  {
    path: '/quality-analysis',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'trend',
        name: 'QualityTrend',
        component: () => import('./views/QualityAnalysis/Trend.vue'),
        meta: { title: '趋势分析 - QMS质量管理系统' }
      },
      {
        path: 'pareto',
        name: 'ParetoAnalysis',
        component: () => import('./views/QualityAnalysis/Pareto.vue'),
        meta: { title: '帕累托分析 - QMS质量管理系统' }
      },
      {
        path: 'fishbone',
        name: 'FishboneAnalysis',
        component: () => import('./views/QualityAnalysis/Fishbone.vue'),
        meta: { title: '鱼骨图分析 - QMS质量管理系统' }
      },
      {
        path: 'capability',
        name: 'CapabilityAnalysis',
        component: () => import('./views/QualityAnalysis/Capability.vue'),
        meta: { title: '能力分析 - QMS质量管理系统' }
      }
    ]
  },
  
  // 不合格品管理模块
  {
    path: '/non-conforming',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'management',
        name: 'NonConformingManagement',
        component: () => import('./views/NonConforming/Management.vue'),
        meta: { title: '不合格品管理 - QMS质量管理系统' }
      }
    ]
  },
  
  // 供应商质量管理模块
  {
    path: '/supplier',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'quality',
        name: 'SupplierQuality',
        component: () => import('./views/Supplier/Quality.vue'),
        meta: { title: '供应商质量管理 - QMS质量管理系统' }
      }
    ]
  },
  
  // 文档管理模块
  {
    path: '/document',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'standard',
        name: 'QualityStandard',
        component: () => import('./views/Document/Standard.vue'),
        meta: { title: '质量标准 - QMS质量管理系统' }
      },
      {
        path: 'procedure',
        name: 'QualityProcedure',
        component: () => import('./views/Document/Procedure.vue'),
        meta: { title: '作业程序 - QMS质量管理系统' }
      },
      {
        path: 'record',
        name: 'QualityRecord',
        component: () => import('./views/Document/Record.vue'),
        meta: { title: '质量记录 - QMS质量管理系统' }
      },
      {
        path: 'manual',
        name: 'QualityManual',
        component: () => import('./views/Document/Manual.vue'),
        meta: { title: '质量手册 - QMS质量管理系统' }
      }
    ]
  },
  
  // 报表管理模块
  {
    path: '/reports',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'management',
        name: 'ReportsManagement',
        component: () => import('./views/Reports/Management.vue'),
        meta: { title: '报表管理 - QMS质量管理系统' }
      }
    ]
  },
  
  // 系统设置模块
  {
    path: '/settings',
    component: () => import('./components/Layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('./views/Settings/User.vue'),
        meta: { title: '用户管理 - QMS质量管理系统' }
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('./views/Settings/Role.vue'),
        meta: { title: '角色权限 - QMS质量管理系统' }
      },
      {
        path: 'system',
        name: 'SystemConfig',
        component: () => import('./views/Settings/System.vue'),
        meta: { title: '系统配置 - QMS质量管理系统' }
      },
      {
        path: 'security',
        name: 'SecuritySettings',
        component: () => import('./views/Settings/Security.vue'),
        meta: { title: '安全设置 - QMS质量管理系统' }
      }
    ]
  },
  
  // 捕获所有未匹配的路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查认证状态
  const isAuthenticated = localStorage.getItem('qms_token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 初始化质量检测特效
  setTimeout(() => {
    qualityEffects.init()
  }, 100)
})

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(ElementPlus)
app.use(router)

// 全局属性
app.config.globalProperties.$qualityEffects = qualityEffects

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('QMS系统错误:', err, info)
}

// 挂载应用
app.mount('#app')

// 初始化质量检测特效
document.addEventListener('DOMContentLoaded', () => {
  qualityEffects.addQualityStyles()
  qualityEffects.init()
})
