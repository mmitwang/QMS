<template>
  <div class="pareto-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>帕累托分析</h2>
      <p>运用80/20法则分析质量问题，识别关键质量因素</p>
    </div>

    <!-- 分析配置 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>分析配置</span>
          <el-button type="primary" @click="generateAnalysis">
            <el-icon><DataAnalysis /></el-icon>
            生成分析
          </el-button>
        </div>
      </template>
      <el-form :model="analysisConfig" :rules="configRules" ref="configFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="分析对象" prop="analysisObject">
              <el-select v-model="analysisConfig.analysisObject" placeholder="选择分析对象" style="width: 100%">
                <el-option label="不合格项" value="defects"></el-option>
                <el-option label="客户投诉" value="complaints"></el-option>
                <el-option label="质量成本" value="costs"></el-option>
                <el-option label="供应商问题" value="suppliers"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间范围" prop="timeRange">
              <el-date-picker
                v-model="analysisConfig.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类维度" prop="dimension">
              <el-select v-model="analysisConfig.dimension" placeholder="选择分类维度" style="width: 100%">
                <el-option label="按类型" value="type"></el-option>
                <el-option label="按产品" value="product"></el-option>
                <el-option label="按工序" value="process"></el-option>
                <el-option label="按原因" value="cause"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 帕累托图表 -->
    <el-card class="chart-card" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>帕累托图</span>
          <div class="chart-actions">
            <el-button size="small" @click="exportChart">
              <el-icon><Download /></el-icon>
              导出图表
            </el-button>
          </div>
        </div>
      </template>
      <div class="chart-container">
        <div ref="paretoChartRef" style="width: 100%; height: 500px;"></div>
      </div>
    </el-card>

    <!-- 分析结果 -->
    <el-row :gutter="20" v-if="showAnalysis">
      <el-col :span="16">
        <!-- 数据表格 -->
        <el-card class="data-table">
          <template #header>
            <div class="card-header">
              <span>详细数据</span>
              <el-button size="small" @click="exportData">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
            </div>
          </template>
          <el-table :data="paretoData" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" align="center" />
            <el-table-column prop="category" label="类别" width="150" />
            <el-table-column prop="count" label="频次" width="100" align="right" />
            <el-table-column prop="percentage" label="占比(%)" width="100" align="right">
              <template #default="scope">
                <span>{{ scope.row.percentage.toFixed(1) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="cumulative" label="累计占比(%)" width="120" align="right">
              <template #default="scope">
                <span :class="getCumulativeClass(scope.row.cumulative)">
                  {{ scope.row.cumulative.toFixed(1) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="重要程度" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getLevelType(scope.row.level)">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 分析摘要 -->
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <span>分析摘要</span>
            </div>
          </template>
          <div class="summary-content">
            <div class="summary-item">
              <div class="summary-label">总项目数</div>
              <div class="summary-value">{{ summary.totalItems }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">总频次</div>
              <div class="summary-value">{{ summary.totalCount }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">A类项目(80%)</div>
              <div class="summary-value critical">{{ summary.aItems }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">B类项目(15%)</div>
              <div class="summary-value important">{{ summary.bItems }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">C类项目(5%)</div>
              <div class="summary-value normal">{{ summary.cItems }}</div>
            </div>
          </div>
        </el-card>

        <!-- 改进建议 -->
        <el-card class="recommendations-card">
          <template #header>
            <div class="card-header">
              <span>改进建议</span>
            </div>
          </template>
          <div class="recommendations-content">
            <div class="recommendation-item" v-for="rec in recommendations" :key="rec.id">
              <div class="recommendation-header">
                <el-icon :class="rec.priority"><Star /></el-icon>
                <span class="recommendation-title">{{ rec.title }}</span>
              </div>
              <div class="recommendation-desc">{{ rec.description }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ABC分类详情 -->
    <el-card class="abc-analysis" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>ABC分类分析</span>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="border-card">
        <!-- A类分析 -->
        <el-tab-pane label="A类(关键)" name="a-class">
          <div class="class-content">
            <div class="class-header">
              <h4>A类项目 - 关键因素 (占总频次的80%)</h4>
              <p>这些是需要重点关注和优先解决的问题</p>
            </div>
            <el-table :data="aClassData" style="width: 100%">
              <el-table-column prop="category" label="类别" width="200" />
              <el-table-column prop="count" label="频次" width="100" align="right" />
              <el-table-column prop="percentage" label="占比" width="100" align="right">
                <template #default="scope">
                  <span>{{ scope.row.percentage.toFixed(1) }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="impact" label="影响程度" width="120">
                <template #default="scope">
                  <el-rate v-model="scope.row.impact" :max="5" disabled />
                </template>
              </el-table-column>
              <el-table-column prop="action" label="建议措施" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- B类分析 -->
        <el-tab-pane label="B类(重要)" name="b-class">
          <div class="class-content">
            <div class="class-header">
              <h4>B类项目 - 重要因素 (占总频次的15%)</h4>
              <p>这些问题需要适度关注，制定改进计划</p>
            </div>
            <el-table :data="bClassData" style="width: 100%">
              <el-table-column prop="category" label="类别" width="200" />
              <el-table-column prop="count" label="频次" width="100" align="right" />
              <el-table-column prop="percentage" label="占比" width="100" align="right">
                <template #default="scope">
                  <span>{{ scope.row.percentage.toFixed(1) }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="impact" label="影响程度" width="120">
                <template #default="scope">
                  <el-rate v-model="scope.row.impact" :max="5" disabled />
                </template>
              </el-table-column>
              <el-table-column prop="action" label="建议措施" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- C类分析 -->
        <el-tab-pane label="C类(一般)" name="c-class">
          <div class="class-content">
            <div class="class-header">
              <h4>C类项目 - 一般因素 (占总频次的5%)</h4>
              <p>这些问题影响较小，可以采用常规管理方式</p>
            </div>
            <el-table :data="cClassData" style="width: 100%">
              <el-table-column prop="category" label="类别" width="200" />
              <el-table-column prop="count" label="频次" width="100" align="right" />
              <el-table-column prop="percentage" label="占比" width="100" align="right">
                <template #default="scope">
                  <span>{{ scope.row.percentage.toFixed(1) }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="impact" label="影响程度" width="120">
                <template #default="scope">
                  <el-rate v-model="scope.row.impact" :max="5" disabled />
                </template>
              </el-table-column>
              <el-table-column prop="action" label="建议措施" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  DataAnalysis,
  Download,
  Star
} from '@element-plus/icons-vue'

// 响应式数据
const showAnalysis = ref(false)
const activeTab = ref('a-class')
const paretoChartRef = ref()
let paretoChartInstance = null

const analysisConfig = reactive({
  analysisObject: '',
  timeRange: [],
  dimension: ''
})

const configRules = {
  analysisObject: [{ required: true, message: '请选择分析对象', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择时间范围', trigger: 'change' }],
  dimension: [{ required: true, message: '请选择分类维度', trigger: 'change' }]
}

const paretoData = ref([])
const aClassData = ref([])
const bClassData = ref([])
const cClassData = ref([])

const summary = reactive({
  totalItems: 0,
  totalCount: 0,
  aItems: 0,
  bItems: 0,
  cItems: 0
})

const recommendations = ref([
  {
    id: 1,
    priority: 'high',
    title: '重点解决A类问题',
    description: '集中资源优先解决占80%频次的关键问题，能够获得最大的改进效果'
  },
  {
    id: 2,
    priority: 'medium',
    title: '制定B类改进计划',
    description: '为B类问题制定中期改进计划，逐步减少其发生频次'
  },
  {
    id: 3,
    priority: 'low',
    title: 'C类问题常规管理',
    description: '对C类问题采用标准化管理，定期监控即可'
  }
])

const configFormRef = ref()

// 方法
const generateAnalysis = () => {
  configFormRef.value?.validate((valid) => {
    if (valid) {
      showAnalysis.value = true
      generateMockData()
      nextTick(() => {
        createParetoChart()
      })
      ElMessage.success('帕累托分析生成成功')
    }
  })
}

const generateMockData = () => {
  // 生成模拟数据
  const mockData = [
    { category: '尺寸偏差', count: 145 },
    { category: '表面缺陷', count: 98 },
    { category: '材料问题', count: 76 },
    { category: '装配错误', count: 54 },
    { category: '包装问题', count: 43 },
    { category: '标识错误', count: 32 },
    { category: '颜色偏差', count: 28 },
    { category: '功能异常', count: 21 },
    { category: '其他问题', count: 18 }
  ]

  // 计算总频次
  const totalCount = mockData.reduce((sum, item) => sum + item.count, 0)
  summary.totalItems = mockData.length
  summary.totalCount = totalCount

  // 计算百分比和累计百分比
  let cumulative = 0
  paretoData.value = mockData.map((item, index) => {
    const percentage = (item.count / totalCount) * 100
    cumulative += percentage
    
    let level = 'C类'
    if (cumulative <= 80) level = 'A类'
    else if (cumulative <= 95) level = 'B类'
    
    return {
      rank: index + 1,
      category: item.category,
      count: item.count,
      percentage: percentage,
      cumulative: cumulative,
      level: level,
      remark: getRemarkByLevel(level)
    }
  })

  // 分类数据
  aClassData.value = paretoData.value.filter(item => item.level === 'A类').map(item => ({
    ...item,
    impact: item.level === 'A类' ? 5 : 4,
    action: getActionByCategory(item.category, 'A')
  }))
  
  bClassData.value = paretoData.value.filter(item => item.level === 'B类').map(item => ({
    ...item,
    impact: 3,
    action: getActionByCategory(item.category, 'B')
  }))
  
  cClassData.value = paretoData.value.filter(item => item.level === 'C类').map(item => ({
    ...item,
    impact: 2,
    action: getActionByCategory(item.category, 'C')
  }))

  // 更新摘要
  summary.aItems = aClassData.value.length
  summary.bItems = bClassData.value.length
  summary.cItems = cClassData.value.length
}

const getRemarkByLevel = (level) => {
  const remarks = {
    'A类': '关键问题，需重点关注',
    'B类': '重要问题，需适度关注',
    'C类': '一般问题，常规管理'
  }
  return remarks[level] || ''
}

const getActionByCategory = (category, level) => {
  const actions = {
    'A': {
      '尺寸偏差': '加强工艺控制，提升设备精度',
      '表面缺陷': '改进表面处理工艺，加强检验',
      '材料问题': '严格供应商管理，加强来料检验'
    },
    'B': {
      '装配错误': '完善作业指导书，加强培训',
      '包装问题': '改进包装工艺，加强检查'
    },
    'C': {
      '标识错误': '标准化标识流程',
      '颜色偏差': '定期校准设备',
      '功能异常': '加强测试验证',
      '其他问题': '持续监控改进'
    }
  }
  return actions[level]?.[category] || '制定针对性改进措施'
}

const createParetoChart = () => {
  if (paretoChartInstance) {
    paretoChartInstance.dispose()
  }
  
  paretoChartInstance = echarts.init(paretoChartRef.value)
  
  const categories = paretoData.value.map(d => d.category)
  const counts = paretoData.value.map(d => d.count)
  const cumulatives = paretoData.value.map(d => d.cumulative)
  
  const option = {
    title: {
      text: '帕累托分析图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['频次', '累计百分比'],
      top: 30
    },
    xAxis: [
      {
        type: 'category',
        data: categories,
        axisPointer: {
          type: 'shadow'
        },
        axisLabel: {
          rotate: 45
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '频次',
        position: 'left'
      },
      {
        type: 'value',
        name: '累计百分比(%)',
        position: 'right',
        max: 100
      }
    ],
    series: [
      {
        name: '频次',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '累计百分比',
        type: 'line',
        yAxisIndex: 1,
        data: cumulatives,
        lineStyle: {
          color: '#F56C6C',
          width: 3
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ],
    markLine: {
      data: [
        {
          yAxis: 80,
          lineStyle: {
            color: '#E6A23C',
            type: 'dashed'
          },
          label: {
            formatter: '80%线'
          }
        }
      ]
    }
  }
  
  paretoChartInstance.setOption(option)
}

const getCumulativeClass = (cumulative) => {
  if (cumulative <= 80) return 'critical'
  if (cumulative <= 95) return 'important'
  return 'normal'
}

const getLevelType = (level) => {
  const types = {
    'A类': 'danger',
    'B类': 'warning',
    'C类': 'info'
  }
  return types[level] || 'info'
}

const exportChart = () => {
  ElMessage.success('导出图表功能开发中')
}

const exportData = () => {
  ElMessage.success('导出数据功能开发中')
}

onMounted(() => {
  console.log('帕累托分析页面已加载')
})
</script>

<style lang="scss" scoped>
.pareto-analysis {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

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

  .config-card,
  .chart-card,
  .data-table,
  .summary-card,
  .recommendations-card,
  .abc-analysis {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
    
    .chart-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .chart-container {
    margin-bottom: 20px;
  }

  .summary-content {
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .summary-label {
        color: #606266;
        font-size: 14px;
      }
      
      .summary-value {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        
        &.critical {
          color: #f56c6c;
        }
        
        &.important {
          color: #e6a23c;
        }
        
        &.normal {
          color: #909399;
        }
      }
    }
  }

  .recommendations-content {
    .recommendation-item {
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f8f9fa;
      border-radius: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .recommendation-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .el-icon {
          margin-right: 8px;
          font-size: 16px;
          
          &.high {
            color: #f56c6c;
          }
          
          &.medium {
            color: #e6a23c;
          }
          
          &.low {
            color: #909399;
          }
        }
        
        .recommendation-title {
          font-weight: 600;
          color: #303133;
        }
      }
      
      .recommendation-desc {
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }

  .class-content {
    .class-header {
      margin-bottom: 20px;
      
      h4 {
        margin: 0 0 8px 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .critical {
    color: #f56c6c;
    font-weight: 600;
  }

  .important {
    color: #e6a23c;
    font-weight: 600;
  }

  .normal {
    color: #909399;
    font-weight: 500;
  }

  :deep(.el-card__header) {
    padding: 18px 20px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fafafa;
  }

  :deep(.el-table) {
    .el-table__header {
      th {
        background-color: #fafafa;
        color: #303133;
        font-weight: 600;
      }
    }
  }

  :deep(.el-tabs__content) {
    padding: 20px 0;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}
</style>
