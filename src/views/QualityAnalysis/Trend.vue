<template>
  <div class="trend-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>质量趋势分析</h2>
      <p>分析质量数据的变化趋势，识别质量改进机会</p>
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
            <el-form-item label="分析类型" prop="analysisType">
              <el-select v-model="analysisConfig.analysisType" placeholder="选择分析类型" style="width: 100%">
                <el-option label="质量指标趋势" value="quality"></el-option>
                <el-option label="不合格率趋势" value="defect"></el-option>
                <el-option label="客户投诉趋势" value="complaint"></el-option>
                <el-option label="成本趋势" value="cost"></el-option>
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
            <el-form-item label="数据粒度" prop="granularity">
              <el-select v-model="analysisConfig.granularity" placeholder="选择数据粒度" style="width: 100%">
                <el-option label="按天" value="day"></el-option>
                <el-option label="按周" value="week"></el-option>
                <el-option label="按月" value="month"></el-option>
                <el-option label="按季度" value="quarter"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="产品线" prop="productLine">
              <el-select v-model="analysisConfig.productLine" placeholder="选择产品线" multiple style="width: 100%">
                <el-option label="产品线A" value="A"></el-option>
                <el-option label="产品线B" value="B"></el-option>
                <el-option label="产品线C" value="C"></el-option>
                <el-option label="产品线D" value="D"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工序" prop="process">
              <el-select v-model="analysisConfig.process" placeholder="选择工序" multiple style="width: 100%">
                <el-option label="来料检验" value="incoming"></el-option>
                <el-option label="过程检验" value="process"></el-option>
                <el-option label="成品检验" value="final"></el-option>
                <el-option label="出厂检验" value="outgoing"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分析维度" prop="dimension">
              <el-select v-model="analysisConfig.dimension" placeholder="选择分析维度" style="width: 100%">
                <el-option label="按产品" value="product"></el-option>
                <el-option label="按供应商" value="supplier"></el-option>
                <el-option label="按检验员" value="inspector"></el-option>
                <el-option label="按班次" value="shift"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 趋势图表 -->
    <el-card class="chart-card" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>{{ getAnalysisTitle() }}</span>
          <div class="chart-actions">
            <el-button-group>
              <el-button 
                :type="chartType === 'line' ? 'primary' : 'default'" 
                size="small" 
                @click="changeChartType('line')"
              >
                线图
              </el-button>
              <el-button 
                :type="chartType === 'bar' ? 'primary' : 'default'" 
                size="small" 
                @click="changeChartType('bar')"
              >
                柱图
              </el-button>
              <el-button 
                :type="chartType === 'area' ? 'primary' : 'default'" 
                size="small" 
                @click="changeChartType('area')"
              >
                面积图
              </el-button>
            </el-button-group>
            <el-button size="small" @click="exportChart">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>
      <div class="chart-container">
        <div ref="trendChartRef" style="width: 100%; height: 400px;"></div>
      </div>
    </el-card>

    <!-- 统计指标 -->
    <el-row :gutter="20" v-if="showAnalysis">
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon trend-up">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metrics.trend }}</div>
              <div class="metric-label">趋势方向</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon average">
              <el-icon><DataBoard /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metrics.average }}</div>
              <div class="metric-label">平均值</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon variance">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metrics.variance }}%</div>
              <div class="metric-label">变异系数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon correlation">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metrics.correlation }}</div>
              <div class="metric-label">相关系数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势分析结果 -->
    <el-card class="analysis-result" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>分析结果</span>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 趋势分析 -->
        <el-tab-pane label="趋势分析" name="trend">
          <div class="analysis-content">
            <div class="analysis-section">
              <h4>趋势特征</h4>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="feature-item">
                    <span class="feature-label">总体趋势：</span>
                    <el-tag :type="getTrendType(trendAnalysis.overallTrend)">
                      {{ trendAnalysis.overallTrend }}
                    </el-tag>
                  </div>
                  <div class="feature-item">
                    <span class="feature-label">变化幅度：</span>
                    <span class="feature-value">{{ trendAnalysis.changeRate }}%</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-label">稳定性：</span>
                    <el-rate v-model="trendAnalysis.stability" :max="5" disabled show-score />
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="feature-item">
                    <span class="feature-label">季节性：</span>
                    <span class="feature-value">{{ trendAnalysis.seasonality ? '存在' : '不存在' }}</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-label">周期性：</span>
                    <span class="feature-value">{{ trendAnalysis.cyclical ? '存在' : '不存在' }}</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-label">异常点：</span>
                    <span class="feature-value">{{ trendAnalysis.outliers }}个</span>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <div class="analysis-section">
              <h4>关键发现</h4>
              <ul class="findings-list">
                <li v-for="finding in trendAnalysis.keyFindings" :key="finding.id">
                  <el-icon :class="finding.type"><Warning /></el-icon>
                  {{ finding.description }}
                </li>
              </ul>
            </div>
          </div>
        </el-tab-pane>

        <!-- 对比分析 -->
        <el-tab-pane label="对比分析" name="comparison">
          <div class="comparison-content">
            <el-table :data="comparisonData" style="width: 100%">
              <el-table-column prop="period" label="时期" width="120" />
              <el-table-column prop="value" label="数值" width="100" />
              <el-table-column prop="change" label="变化" width="100">
                <template #default="scope">
                  <span :class="getChangeClass(scope.row.change)">
                    {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.change }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="rank" label="排名" width="80" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 预测分析 -->
        <el-tab-pane label="预测分析" name="forecast">
          <div class="forecast-content">
            <div class="forecast-chart">
              <div ref="forecastChartRef" style="width: 100%; height: 300px;"></div>
            </div>
            <div class="forecast-summary">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="forecast-item">
                    <div class="forecast-label">下期预测值</div>
                    <div class="forecast-value">{{ forecast.nextValue }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="forecast-item">
                    <div class="forecast-label">预测区间</div>
                    <div class="forecast-value">{{ forecast.confidenceInterval }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="forecast-item">
                    <div class="forecast-label">预测准确度</div>
                    <div class="forecast-value">{{ forecast.accuracy }}%</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 改进建议 -->
        <el-tab-pane label="改进建议" name="recommendations">
          <div class="recommendations-content">
            <div class="recommendation-item" v-for="rec in recommendations" :key="rec.id">
              <div class="recommendation-header">
                <el-icon :class="rec.priority"><Star /></el-icon>
                <span class="recommendation-title">{{ rec.title }}</span>
                <el-tag :type="getPriorityType(rec.priority)" size="small">
                  {{ rec.priority }}
                </el-tag>
              </div>
              <div class="recommendation-content">
                <p>{{ rec.description }}</p>
                <div class="recommendation-actions">
                  <span class="action-label">建议措施：</span>
                  <ul>
                    <li v-for="action in rec.actions" :key="action">{{ action }}</li>
                  </ul>
                </div>
                <div class="recommendation-impact">
                  <span class="impact-label">预期效果：</span>
                  <span class="impact-value">{{ rec.expectedImpact }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="data-table" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>原始数据</span>
          <el-button size="small" @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </template>
      <el-table :data="rawData" style="width: 100%" max-height="400">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="value" label="数值" width="100" />
        <el-table-column prop="target" label="目标值" width="100" />
        <el-table-column prop="deviation" label="偏差" width="100">
          <template #default="scope">
            <span :class="getDeviationClass(scope.row.deviation)">
              {{ scope.row.deviation > 0 ? '+' : '' }}{{ scope.row.deviation }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
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
  TrendCharts,
  DataBoard,
  DataLine,
  Connection,
  Warning,
  Star
} from '@element-plus/icons-vue'

// 响应式数据
const showAnalysis = ref(false)
const chartType = ref('line')
const activeTab = ref('trend')
const trendChartRef = ref()
const forecastChartRef = ref()
let trendChartInstance = null
let forecastChartInstance = null

const analysisConfig = reactive({
  analysisType: '',
  timeRange: [],
  granularity: '',
  productLine: [],
  process: [],
  dimension: ''
})

const configRules = {
  analysisType: [{ required: true, message: '请选择分析类型', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择时间范围', trigger: 'change' }],
  granularity: [{ required: true, message: '请选择数据粒度', trigger: 'change' }]
}

const metrics = reactive({
  trend: '上升',
  average: '92.5',
  variance: '3.2',
  correlation: '0.85'
})

const trendAnalysis = reactive({
  overallTrend: '上升',
  changeRate: 15.6,
  stability: 4,
  seasonality: true,
  cyclical: false,
  outliers: 3,
  keyFindings: [
    { id: 1, type: 'info', description: '质量指标呈现稳定上升趋势，月均增长率为2.3%' },
    { id: 2, type: 'warning', description: '第3季度存在明显波动，需要关注季节性因素' },
    { id: 3, type: 'success', description: '最近3个月质量水平显著提升，达到历史最高水平' }
  ]
})

const comparisonData = ref([
  { period: '2024-Q1', value: 89.2, change: -2.1, rank: 4, status: '一般', remark: '春节影响' },
  { period: '2024-Q2', value: 91.5, change: 2.6, rank: 3, status: '良好', remark: '生产恢复' },
  { period: '2024-Q3', value: 94.8, change: 3.6, rank: 2, status: '优秀', remark: '工艺改进' },
  { period: '2024-Q4', value: 96.2, change: 1.5, rank: 1, status: '优秀', remark: '持续改进' }
])

const forecast = reactive({
  nextValue: '97.5',
  confidenceInterval: '[95.2, 99.8]',
  accuracy: '87.3'
})

const recommendations = ref([
  {
    id: 1,
    title: '加强过程控制',
    priority: '高',
    description: '基于趋势分析，建议在关键工序增加控制点，提高过程稳定性。',
    actions: [
      '在关键工序设置SPC控制图',
      '增加过程参数监控频次',
      '建立异常快速响应机制'
    ],
    expectedImpact: '预计可降低变异30%，提升质量稳定性'
  },
  {
    id: 2,
    title: '优化检验策略',
    priority: '中',
    description: '根据质量趋势，调整检验重点和频次，提高检验效率。',
    actions: [
      '对稳定工序减少检验频次',
      '对波动工序增加检验力度',
      '引入风险评估模型'
    ],
    expectedImpact: '预计可节约检验成本15%，同时保持质量水平'
  }
])

const rawData = ref([])

const configFormRef = ref()

// 方法
const getAnalysisTitle = () => {
  const titles = {
    quality: '质量指标趋势分析',
    defect: '不合格率趋势分析',
    complaint: '客户投诉趋势分析',
    cost: '质量成本趋势分析'
  }
  return titles[analysisConfig.analysisType] || '趋势分析'
}

const generateAnalysis = () => {
  configFormRef.value?.validate((valid) => {
    if (valid) {
      showAnalysis.value = true
      generateMockData()
      nextTick(() => {
        createTrendChart()
        createForecastChart()
      })
      ElMessage.success('分析生成成功')
    }
  })
}

const generateMockData = () => {
  rawData.value = []
  const startDate = new Date(analysisConfig.timeRange[0])
  const endDate = new Date(analysisConfig.timeRange[1])
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  
  for (let i = 0; i <= days; i += 7) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const value = Math.round((Math.random() * 10 + 90) * 10) / 10
    const target = 95
    rawData.value.push({
      date: date.toISOString().split('T')[0],
      value: value,
      target: target,
      deviation: Math.round((value - target) * 10) / 10,
      category: analysisConfig.analysisType,
      remark: value < target ? '需改进' : '达标'
    })
  }
}

const createTrendChart = () => {
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  
  trendChartInstance = echarts.init(trendChartRef.value)
  
  const dates = rawData.value.map(d => d.date)
  const values = rawData.value.map(d => d.value)
  const targets = rawData.value.map(d => d.target)
  
  const option = {
    title: {
      text: getAnalysisTitle(),
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['实际值', '目标值'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '实际值',
        type: chartType.value,
        data: values,
        smooth: true,
        lineStyle: {
          color: '#409EFF'
        },
        areaStyle: chartType.value === 'area' ? { color: 'rgba(64, 158, 255, 0.3)' } : null
      },
      {
        name: '目标值',
        type: 'line',
        data: targets,
        lineStyle: {
          color: '#67C23A',
          type: 'dashed'
        }
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

const createForecastChart = () => {
  if (forecastChartInstance) {
    forecastChartInstance.dispose()
  }
  
  forecastChartInstance = echarts.init(forecastChartRef.value)
  
  const historicalData = rawData.value.slice(-10).map(d => d.value)
  const forecastData = [96.5, 97.2, 97.8, 98.1, 98.5]
  const allData = [...historicalData, ...forecastData]
  const labels = [...Array(15).keys()].map(i => `期间${i + 1}`)
  
  const option = {
    title: {
      text: '预测分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['历史数据', '预测数据', '置信区间'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: labels
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '历史数据',
        type: 'line',
        data: historicalData.concat(Array(5).fill(null)),
        lineStyle: { color: '#409EFF' }
      },
      {
        name: '预测数据',
        type: 'line',
        data: Array(10).fill(null).concat(forecastData),
        lineStyle: { color: '#F56C6C', type: 'dashed' }
      }
    ]
  }
  
  forecastChartInstance.setOption(option)
}

const changeChartType = (type) => {
  chartType.value = type
  if (trendChartInstance) {
    createTrendChart()
  }
}

const getTrendType = (trend) => {
  const types = {
    '上升': 'success',
    '下降': 'danger',
    '稳定': 'info'
  }
  return types[trend] || 'info'
}

const getChangeClass = (change) => {
  if (change > 0) return 'positive-change'
  if (change < 0) return 'negative-change'
  return 'neutral-change'
}

const getStatusType = (status) => {
  const types = {
    '优秀': 'success',
    '良好': 'primary',
    '一般': 'warning',
    '差': 'danger'
  }
  return types[status] || 'info'
}

const getDeviationClass = (deviation) => {
  if (deviation > 0) return 'positive-deviation'
  if (deviation < 0) return 'negative-deviation'
  return 'neutral-deviation'
}

const getPriorityType = (priority) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[priority] || 'info'
}

const exportChart = () => {
  ElMessage.success('导出图表功能开发中')
}

const exportData = () => {
  ElMessage.success('导出数据功能开发中')
}

onMounted(() => {
  console.log('质量趋势分析页面已加载')
})
</script>

<style lang="scss" scoped>
.trend-analysis {
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
  .analysis-result,
  .data-table {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .metric-card {
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .metric-content {
      display: flex;
      align-items: center;
      
      .metric-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        
        &.trend-up {
          background-color: #f0f9ff;
          color: #67c23a;
        }
        
        &.average {
          background-color: #ecf5ff;
          color: #409eff;
        }
        
        &.variance {
          background-color: #fdf6ec;
          color: #e6a23c;
        }
        
        &.correlation {
          background-color: #fef0f0;
          color: #f56c6c;
        }
      }
      
      .metric-info {
        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
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

  .analysis-content {
    .analysis-section {
      margin-bottom: 30px;
      
      h4 {
        margin: 0 0 16px 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
        border-bottom: 2px solid #409eff;
        padding-bottom: 8px;
      }
      
      .feature-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        .feature-label {
          min-width: 100px;
          color: #606266;
          font-size: 14px;
        }
        
        .feature-value {
          color: #303133;
          font-weight: 500;
        }
      }
      
      .findings-list {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          padding: 12px;
          background-color: #f8f9fa;
          border-radius: 4px;
          
          .el-icon {
            margin-right: 8px;
            margin-top: 2px;
            
            &.info {
              color: #409eff;
            }
            
            &.warning {
              color: #e6a23c;
            }
            
            &.success {
              color: #67c23a;
            }
          }
        }
      }
    }
  }

  .positive-change {
    color: #67c23a;
    font-weight: 600;
  }

  .negative-change {
    color: #f56c6c;
    font-weight: 600;
  }

  .neutral-change {
    color: #909399;
    font-weight: 600;
  }

  .positive-deviation {
    color: #67c23a;
    font-weight: 500;
  }

  .negative-deviation {
    color: #f56c6c;
    font-weight: 500;
  }

  .neutral-deviation {
    color: #909399;
    font-weight: 500;
  }

  .forecast-content {
    .forecast-chart {
      margin-bottom: 20px;
    }
    
    .forecast-summary {
      padding: 20px;
      background-color: #fafafa;
      border-radius: 4px;
      
      .forecast-item {
        text-align: center;
        
        .forecast-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }
        
        .forecast-value {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }

  .recommendations-content {
    .recommendation-item {
      margin-bottom: 24px;
      padding: 20px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      background-color: #fff;
      
      .recommendation-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        .el-icon {
          margin-right: 8px;
          font-size: 18px;
          
          &.高 {
            color: #f56c6c;
          }
          
          &.中 {
            color: #e6a23c;
          }
          
          &.低 {
            color: #909399;
          }
        }
        
        .recommendation-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
      
      .recommendation-content {
        p {
          margin: 0 0 16px 0;
          color: #606266;
          line-height: 1.6;
        }
        
        .recommendation-actions {
          margin-bottom: 16px;
          
          .action-label {
            font-weight: 600;
            color: #303133;
            margin-bottom: 8px;
            display: block;
          }
          
          ul {
            margin: 8px 0 0 0;
            padding-left: 20px;
            
            li {
              margin-bottom: 4px;
              color: #606266;
            }
          }
        }
        
        .recommendation-impact {
          .impact-label {
            font-weight: 600;
            color: #303133;
          }
          
          .impact-value {
            color: #67c23a;
            font-weight: 500;
          }
        }
      }
    }
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
