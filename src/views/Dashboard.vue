<template>
  <div class="qms-dashboard">
    <!-- 质量概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(card, index) in overviewCards" :key="index">
          <div class="quality-metric-card" :class="card.type">
            <div class="card-icon">
              <i :class="card.icon"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ card.value }}</div>
              <div class="card-title">{{ card.title }}</div>
              <div class="card-trend" :class="card.trend">
                <i :class="card.trendIcon"></i>
                <span>{{ card.trendValue }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 质量趋势图表 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="qms-card">
            <div class="card-header">
              <h3>质量趋势分析</h3>
              <el-select v-model="trendPeriod" size="small">
                <el-option label="近7天" value="7d"></el-option>
                <el-option label="近30天" value="30d"></el-option>
                <el-option label="近90天" value="90d"></el-option>
              </el-select>
            </div>
            <div class="chart-container">
              <div ref="trendChart" class="chart"></div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="12">
          <div class="qms-card">
            <div class="card-header">
              <h3>质量分布统计</h3>
            </div>
            <div class="chart-container">
              <div ref="distributionChart" class="chart"></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 质量检验状态 -->
    <div class="inspection-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <div class="qms-card">
            <div class="card-header">
              <h3>实时质量检验状态</h3>
              <el-button type="primary" size="small" @click="refreshInspection">
                <i class="el-icon-refresh"></i> 刷新
              </el-button>
            </div>
            <div class="inspection-list">
              <div v-for="(item, index) in inspectionItems" :key="index" 
                   class="inspection-item" :class="item.status">
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-details">
                    <span>批次号: {{ item.batchNo }}</span>
                    <span>检验员: {{ item.inspector }}</span>
                    <span>时间: {{ item.time }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <div class="status-indicator" :class="item.status"></div>
                  <span class="status-text">{{ getStatusText(item.status) }}</span>
                </div>
                <div class="item-progress">
                  <el-progress :percentage="item.progress" :status="getProgressStatus(item.status)"></el-progress>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="8">
          <div class="qms-card">
            <div class="card-header">
              <h3>质量预警</h3>
            </div>
            <div class="alert-list">
              <div v-for="(alert, index) in qualityAlerts" :key="index" 
                   class="alert-item" :class="alert.level">
                <div class="alert-icon">
                  <i :class="getAlertIcon(alert.level)"></i>
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-desc">{{ alert.description }}</div>
                  <div class="alert-time">{{ alert.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 质量流程监控 -->
    <div class="process-section">
      <div class="qms-card">
        <div class="card-header">
          <h3>质量流程监控</h3>
        </div>
        <div class="process-flow">
          <div v-for="(step, index) in processSteps" :key="index" 
               class="process-step" :class="step.status">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.description }}</div>
              <div class="step-metrics">
                <span>完成率: {{ step.completion }}%</span>
                <span>合格率: {{ step.passRate }}%</span>
              </div>
            </div>
            <div class="step-status">
              <div class="status-dot" :class="step.status"></div>
            </div>
            <div v-if="index < processSteps.length - 1" class="step-connector"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'QMSDashboard',
  setup() {
    const trendPeriod = ref('30d')
    const trendChart = ref(null)
    const distributionChart = ref(null)
    let trendChartInstance = null
    let distributionChartInstance = null

    // 概览卡片数据
    const overviewCards = ref([
      {
        title: '合格率',
        value: '98.5%',
        icon: 'el-icon-success',
        type: 'success',
        trend: 'up',
        trendIcon: 'el-icon-top',
        trendValue: '+2.3%'
      },
      {
        title: '检验批次',
        value: '1,247',
        icon: 'el-icon-document-checked',
        type: 'primary',
        trend: 'up',
        trendIcon: 'el-icon-top',
        trendValue: '+15'
      },
      {
        title: '不合格品',
        value: '23',
        icon: 'el-icon-warning',
        type: 'warning',
        trend: 'down',
        trendIcon: 'el-icon-bottom',
        trendValue: '-5'
      },
      {
        title: '返工率',
        value: '1.2%',
        icon: 'el-icon-refresh-left',
        type: 'info',
        trend: 'down',
        trendIcon: 'el-icon-bottom',
        trendValue: '-0.3%'
      }
    ])

    // 检验项目数据
    const inspectionItems = ref([
      {
        name: '电机绝缘测试',
        batchNo: 'QC20240106001',
        inspector: '张工',
        time: '09:15',
        status: 'testing',
        progress: 75
      },
      {
        name: '泵体密封检测',
        batchNo: 'QC20240106002',
        inspector: '李工',
        time: '08:45',
        status: 'passed',
        progress: 100
      },
      {
        name: '阀门压力测试',
        batchNo: 'QC20240106003',
        inspector: '王工',
        time: '10:30',
        status: 'failed',
        progress: 100
      },
      {
        name: '控制器功能测试',
        batchNo: 'QC20240106004',
        inspector: '赵工',
        time: '11:00',
        status: 'pending',
        progress: 0
      }
    ])

    // 质量预警数据
    const qualityAlerts = ref([
      {
        title: '温度异常',
        description: '生产线3号温度超出正常范围',
        level: 'high',
        time: '2分钟前'
      },
      {
        title: '材料批次变更',
        description: '原材料供应商批次发生变更',
        level: 'medium',
        time: '15分钟前'
      },
      {
        title: '设备维护提醒',
        description: '检测设备需要定期校准',
        level: 'low',
        time: '1小时前'
      }
    ])

    // 质量流程步骤
    const processSteps = ref([
      {
        title: '来料检验',
        description: '原材料质量检验',
        completion: 95,
        passRate: 98.2,
        status: 'completed'
      },
      {
        title: '过程检验',
        description: '生产过程质量控制',
        completion: 78,
        passRate: 97.8,
        status: 'active'
      },
      {
        title: '成品检验',
        description: '最终产品质量检验',
        completion: 45,
        passRate: 99.1,
        status: 'pending'
      },
      {
        title: '出厂检验',
        description: '产品出厂前最终检验',
        completion: 0,
        passRate: 0,
        status: 'waiting'
      }
    ])

    // 初始化趋势图表
    const initTrendChart = () => {
      if (!trendChart.value) return
      
      trendChartInstance = echarts.init(trendChart.value)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['合格率', '检验批次', '不合格品数']
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: [
          {
            type: 'value',
            name: '合格率(%)',
            position: 'left'
          },
          {
            type: 'value',
            name: '数量',
            position: 'right'
          }
        ],
        series: [
          {
            name: '合格率',
            type: 'line',
            yAxisIndex: 0,
            data: [96.5, 97.2, 98.1, 97.8, 98.5, 98.2],
            smooth: true,
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '检验批次',
            type: 'bar',
            yAxisIndex: 1,
            data: [1200, 1350, 1180, 1420, 1247, 1380],
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '不合格品数',
            type: 'line',
            yAxisIndex: 1,
            data: [45, 38, 22, 31, 23, 25],
            smooth: true,
            itemStyle: { color: '#F56C6C' }
          }
        ]
      }
      trendChartInstance.setOption(option)
    }

    // 初始化分布图表
    const initDistributionChart = () => {
      if (!distributionChart.value) return
      
      distributionChartInstance = echarts.init(distributionChart.value)
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '质量分布',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1035, name: '优秀' },
              { value: 310, name: '良好' },
              { value: 234, name: '合格' },
              { value: 135, name: '待改进' },
              { value: 23, name: '不合格' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      distributionChartInstance.setOption(option)
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'testing': '检验中',
        'passed': '合格',
        'failed': '不合格',
        'pending': '待检验'
      }
      return statusMap[status] || '未知'
    }

    // 获取进度条状态
    const getProgressStatus = (status) => {
      const statusMap = {
        'testing': '',
        'passed': 'success',
        'failed': 'exception',
        'pending': ''
      }
      return statusMap[status] || ''
    }

    // 获取预警图标
    const getAlertIcon = (level) => {
      const iconMap = {
        'high': 'el-icon-warning',
        'medium': 'el-icon-info',
        'low': 'el-icon-bell'
      }
      return iconMap[level] || 'el-icon-info'
    }

    // 刷新检验数据
    const refreshInspection = () => {
      // 模拟数据刷新
      console.log('刷新检验数据')
    }

    // 窗口大小变化处理
    const handleResize = () => {
      if (trendChartInstance) {
        trendChartInstance.resize()
      }
      if (distributionChartInstance) {
        distributionChartInstance.resize()
      }
    }

    onMounted(() => {
      setTimeout(() => {
        initTrendChart()
        initDistributionChart()
      }, 100)
      
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (trendChartInstance) {
        trendChartInstance.dispose()
      }
      if (distributionChartInstance) {
        distributionChartInstance.dispose()
      }
      window.removeEventListener('resize', handleResize)
    })

    return {
      trendPeriod,
      trendChart,
      distributionChart,
      overviewCards,
      inspectionItems,
      qualityAlerts,
      processSteps,
      getStatusText,
      getProgressStatus,
      getAlertIcon,
      refreshInspection
    }
  }
}
</script>

<style lang="scss" scoped>
.qms-dashboard {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;

  .overview-cards {
    margin-bottom: 20px;

    .quality-metric-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      border-left: 4px solid #409EFF;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      &.success {
        border-left-color: #67C23A;
        .card-icon i {
          color: #67C23A;
        }
      }

      &.warning {
        border-left-color: #E6A23C;
        .card-icon i {
          color: #E6A23C;
        }
      }

      &.info {
        border-left-color: #909399;
        .card-icon i {
          color: #909399;
        }
      }

      .card-icon {
        margin-right: 15px;
        i {
          font-size: 32px;
          color: #409EFF;
        }
      }

      .card-content {
        flex: 1;

        .card-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .card-title {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }

        .card-trend {
          font-size: 12px;
          display: flex;
          align-items: center;

          &.up {
            color: #67C23A;
          }

          &.down {
            color: #F56C6C;
          }

          i {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 20px;

    .chart-container {
      height: 300px;
      .chart {
        width: 100%;
        height: 100%;
      }
    }
  }

  .inspection-section {
    margin-bottom: 20px;

    .inspection-list {
      .inspection-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #EBEEF5;
        transition: all 0.3s ease;

        &:hover {
          background-color: #F5F7FA;
        }

        .item-info {
          flex: 1;
          margin-right: 20px;

          .item-name {
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }

          .item-details {
            font-size: 12px;
            color: #909399;

            span {
              margin-right: 15px;
            }
          }
        }

        .item-status {
          display: flex;
          align-items: center;
          margin-right: 20px;

          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;

            &.testing {
              background-color: #409EFF;
              animation: qualityPulse 2s infinite;
            }

            &.passed {
              background-color: #67C23A;
            }

            &.failed {
              background-color: #F56C6C;
            }

            &.pending {
              background-color: #909399;
            }
          }

          .status-text {
            font-size: 12px;
            color: #606266;
          }
        }

        .item-progress {
          width: 120px;
        }
      }
    }

    .alert-list {
      .alert-item {
        display: flex;
        align-items: flex-start;
        padding: 12px;
        border-bottom: 1px solid #EBEEF5;

        &.high {
          border-left: 3px solid #F56C6C;
        }

        &.medium {
          border-left: 3px solid #E6A23C;
        }

        &.low {
          border-left: 3px solid #909399;
        }

        .alert-icon {
          margin-right: 10px;
          margin-top: 2px;

          i {
            font-size: 16px;
          }
        }

        .alert-content {
          flex: 1;

          .alert-title {
            font-weight: bold;
            color: #303133;
            margin-bottom: 4px;
          }

          .alert-desc {
            font-size: 12px;
            color: #606266;
            margin-bottom: 4px;
          }

          .alert-time {
            font-size: 11px;
            color: #C0C4CC;
          }
        }
      }
    }
  }

  .process-section {
    .process-flow {
      display: flex;
      align-items: center;
      padding: 20px;
      overflow-x: auto;

      .process-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 200px;
        position: relative;

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #E4E7ED;
          color: #909399;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .step-content {
          text-align: center;
          margin-bottom: 10px;

          .step-title {
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }

          .step-desc {
            font-size: 12px;
            color: #606266;
            margin-bottom: 8px;
          }

          .step-metrics {
            font-size: 11px;
            color: #909399;

            span {
              display: block;
              margin-bottom: 2px;
            }
          }
        }

        .step-status {
          .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #E4E7ED;

            &.completed {
              background-color: #67C23A;
            }

            &.active {
              background-color: #409EFF;
              animation: qualityPulse 2s infinite;
            }

            &.pending {
              background-color: #E6A23C;
            }

            &.waiting {
              background-color: #C0C4CC;
            }
          }
        }

        .step-connector {
          position: absolute;
          top: 20px;
          left: 100%;
          width: 60px;
          height: 2px;
          background-color: #E4E7ED;
          z-index: 1;
        }

        &.completed {
          .step-number {
            background-color: #67C23A;
            color: white;
          }

          .step-connector {
            background-color: #67C23A;
          }
        }

        &.active {
          .step-number {
            background-color: #409EFF;
            color: white;
            animation: qualityPulse 2s infinite;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .qms-dashboard {
    padding: 10px;

    .process-flow {
      flex-direction: column;

      .process-step {
        margin-bottom: 20px;

        .step-connector {
          display: none;
        }
      }
    }
  }
}
</style>
