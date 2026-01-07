<template>
  <div class="capability-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>过程能力分析</h2>
      <p>评估过程满足规格要求的能力，计算Cp、Cpk等能力指数</p>
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
          <el-col :span="6">
            <el-form-item label="质量特性" prop="characteristic">
              <el-input v-model="analysisConfig.characteristic" placeholder="如：尺寸、重量等" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="规格上限" prop="usl">
              <el-input-number v-model="analysisConfig.usl" :precision="3" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="规格下限" prop="lsl">
              <el-input-number v-model="analysisConfig.lsl" :precision="3" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标值" prop="target">
              <el-input-number v-model="analysisConfig.target" :precision="3" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="数据来源" prop="dataSource">
              <el-select v-model="analysisConfig.dataSource" placeholder="选择数据来源" style="width: 100%">
                <el-option label="手动输入" value="manual"></el-option>
                <el-option label="文件导入" value="import"></el-option>
                <el-option label="数据库查询" value="database"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="样本数量" prop="sampleSize">
              <el-input-number v-model="analysisConfig.sampleSize" :min="30" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="置信水平" prop="confidenceLevel">
              <el-select v-model="analysisConfig.confidenceLevel" placeholder="选择置信水平" style="width: 100%">
                <el-option label="90%" value="0.90"></el-option>
                <el-option label="95%" value="0.95"></el-option>
                <el-option label="99%" value="0.99"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 能力分析结果 -->
    <el-row :gutter="20" v-if="showAnalysis">
      <!-- 能力指数 -->
      <el-col :span="8">
        <el-card class="capability-indices">
          <template #header>
            <div class="card-header">
              <span>能力指数</span>
            </div>
          </template>
          <div class="indices-content">
            <div class="index-item">
              <div class="index-label">Cp (潜在能力)</div>
              <div class="index-value" :class="getCapabilityClass(capabilityIndices.cp)">
                {{ capabilityIndices.cp }}
              </div>
              <div class="index-desc">{{ getCapabilityDesc('cp', capabilityIndices.cp) }}</div>
            </div>
            <div class="index-item">
              <div class="index-label">Cpk (实际能力)</div>
              <div class="index-value" :class="getCapabilityClass(capabilityIndices.cpk)">
                {{ capabilityIndices.cpk }}
              </div>
              <div class="index-desc">{{ getCapabilityDesc('cpk', capabilityIndices.cpk) }}</div>
            </div>
            <div class="index-item">
              <div class="index-label">Cpm (修正能力)</div>
              <div class="index-value" :class="getCapabilityClass(capabilityIndices.cpm)">
                {{ capabilityIndices.cpm }}
              </div>
              <div class="index-desc">{{ getCapabilityDesc('cpm', capabilityIndices.cpm) }}</div>
            </div>
            <div class="index-item">
              <div class="index-label">Pp (性能指数)</div>
              <div class="index-value" :class="getCapabilityClass(capabilityIndices.pp)">
                {{ capabilityIndices.pp }}
              </div>
              <div class="index-desc">{{ getCapabilityDesc('pp', capabilityIndices.pp) }}</div>
            </div>
            <div class="index-item">
              <div class="index-label">Ppk (性能能力)</div>
              <div class="index-value" :class="getCapabilityClass(capabilityIndices.ppk)">
                {{ capabilityIndices.ppk }}
              </div>
              <div class="index-desc">{{ getCapabilityDesc('ppk', capabilityIndices.ppk) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 统计摘要 -->
      <el-col :span="8">
        <el-card class="statistics-summary">
          <template #header>
            <div class="card-header">
              <span>统计摘要</span>
            </div>
          </template>
          <div class="summary-content">
            <div class="summary-item">
              <div class="summary-label">样本数量</div>
              <div class="summary-value">{{ statistics.count }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">均值 (X̄)</div>
              <div class="summary-value">{{ statistics.mean }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">标准差 (σ)</div>
              <div class="summary-value">{{ statistics.stdDev }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">最小值</div>
              <div class="summary-value">{{ statistics.min }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">最大值</div>
              <div class="summary-value">{{ statistics.max }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">范围</div>
              <div class="summary-value">{{ statistics.range }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 不合格率预测 -->
      <el-col :span="8">
        <el-card class="defect-prediction">
          <template #header>
            <div class="card-header">
              <span>不合格率预测</span>
            </div>
          </template>
          <div class="prediction-content">
            <div class="prediction-item">
              <div class="prediction-label">超出上限 (PPM)</div>
              <div class="prediction-value critical">{{ defectRates.upperPPM }}</div>
            </div>
            <div class="prediction-item">
              <div class="prediction-label">超出下限 (PPM)</div>
              <div class="prediction-value critical">{{ defectRates.lowerPPM }}</div>
            </div>
            <div class="prediction-item">
              <div class="prediction-label">总不合格率 (PPM)</div>
              <div class="prediction-value critical">{{ defectRates.totalPPM }}</div>
            </div>
            <div class="prediction-item">
              <div class="prediction-label">合格率</div>
              <div class="prediction-value success">{{ defectRates.yieldRate }}%</div>
            </div>
            <div class="prediction-item">
              <div class="prediction-label">西格玛水平</div>
              <div class="prediction-value">{{ defectRates.sigmaLevel }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表分析 -->
    <el-row :gutter="20" v-if="showAnalysis">
      <el-col :span="12">
        <!-- 直方图 -->
        <el-card class="histogram-card">
          <template #header>
            <div class="card-header">
              <span>直方图与正态分布</span>
              <el-button size="small" @click="exportChart('histogram')">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <div ref="histogramRef" style="width: 100%; height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <!-- 概率图 -->
        <el-card class="probability-card">
          <template #header>
            <div class="card-header">
              <span>正态概率图</span>
              <el-button size="small" @click="exportChart('probability')">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <div ref="probabilityRef" style="width: 100%; height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表 -->
    <el-card class="data-table" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>测量数据</span>
          <div class="table-actions">
            <el-button size="small" @click="importData">
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>
            <el-button size="small" @click="exportData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="measurementData" style="width: 100%" max-height="400">
        <el-table-column prop="index" label="序号" width="80" align="center" />
        <el-table-column prop="value" label="测量值" width="120" align="right">
          <template #default="scope">
            <span :class="getValueClass(scope.row.value)">
              {{ scope.row.value }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviation" label="偏差" width="120" align="right">
          <template #default="scope">
            <span :class="getDeviationClass(scope.row.deviation)">
              {{ scope.row.deviation > 0 ? '+' : '' }}{{ scope.row.deviation }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="测量时间" width="180" />
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>

    <!-- 改进建议 -->
    <el-card class="recommendations-card" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>改进建议</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" v-for="rec in recommendations" :key="rec.id">
          <div class="recommendation-item">
            <div class="recommendation-header">
              <el-icon :class="rec.priority"><Star /></el-icon>
              <span class="recommendation-title">{{ rec.title }}</span>
              <el-tag :type="getPriorityType(rec.priority)" size="small">
                {{ rec.priority }}
              </el-tag>
            </div>
            <div class="recommendation-desc">{{ rec.description }}</div>
            <div class="recommendation-actions">
              <span class="action-label">建议措施：</span>
              <ul>
                <li v-for="action in rec.actions" :key="action">{{ action }}</li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
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
  Upload,
  Star
} from '@element-plus/icons-vue'

// 响应式数据
const showAnalysis = ref(false)
const histogramRef = ref()
const probabilityRef = ref()
let histogramInstance = null
let probabilityInstance = null

const analysisConfig = reactive({
  characteristic: '',
  usl: null,
  lsl: null,
  target: null,
  dataSource: '',
  sampleSize: 100,
  confidenceLevel: ''
})

const configRules = {
  characteristic: [{ required: true, message: '请输入质量特性', trigger: 'blur' }],
  usl: [{ required: true, message: '请输入规格上限', trigger: 'blur' }],
  lsl: [{ required: true, message: '请输入规格下限', trigger: 'blur' }],
  dataSource: [{ required: true, message: '请选择数据来源', trigger: 'change' }],
  confidenceLevel: [{ required: true, message: '请选择置信水平', trigger: 'change' }]
}

const capabilityIndices = reactive({
  cp: '1.25',
  cpk: '1.18',
  cpm: '1.15',
  pp: '1.22',
  ppk: '1.16'
})

const statistics = reactive({
  count: 100,
  mean: '10.025',
  stdDev: '0.082',
  min: '9.785',
  max: '10.265',
  range: '0.480'
})

const defectRates = reactive({
  upperPPM: '125',
  lowerPPM: '89',
  totalPPM: '214',
  yieldRate: '99.98',
  sigmaLevel: '4.8'
})

const measurementData = ref([])

const recommendations = ref([
  {
    id: 1,
    priority: '高',
    title: '提升过程能力',
    description: 'Cpk值偏低，需要改进过程稳定性',
    actions: [
      '分析变异源，减少过程波动',
      '优化工艺参数设置',
      '加强设备维护保养'
    ]
  },
  {
    id: 2,
    priority: '中',
    title: '调整过程中心',
    description: '过程均值偏离目标值',
    actions: [
      '校准设备参数',
      '调整工艺设定值',
      '加强过程监控'
    ]
  },
  {
    id: 3,
    priority: '低',
    title: '持续监控',
    description: '建立长期监控机制',
    actions: [
      '定期进行能力分析',
      '建立预警机制',
      '持续改进过程'
    ]
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
        createHistogram()
        createProbabilityPlot()
      })
      ElMessage.success('过程能力分析生成成功')
    }
  })
}

const generateMockData = () => {
  // 生成模拟测量数据
  measurementData.value = []
  const mean = analysisConfig.target || 10.0
  const stdDev = 0.08
  
  for (let i = 1; i <= analysisConfig.sampleSize; i++) {
    // 生成正态分布随机数
    const value = normalRandom(mean, stdDev)
    const deviation = value - mean
    let status = '合格'
    
    if (analysisConfig.usl && value > analysisConfig.usl) {
      status = '超上限'
    } else if (analysisConfig.lsl && value < analysisConfig.lsl) {
      status = '超下限'
    }
    
    measurementData.value.push({
      index: i,
      value: value.toFixed(3),
      deviation: deviation.toFixed(3),
      status: status,
      timestamp: new Date(Date.now() - (analysisConfig.sampleSize - i) * 3600000).toLocaleString(),
      operator: `OP${Math.floor(Math.random() * 5) + 1}`,
      remark: status === '合格' ? '' : '需要关注'
    })
  }
}

// 生成正态分布随机数
const normalRandom = (mean, stdDev) => {
  let u = 0, v = 0
  while(u === 0) u = Math.random()
  while(v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return z * stdDev + mean
}

const createHistogram = () => {
  if (histogramInstance) {
    histogramInstance.dispose()
  }
  
  histogramInstance = echarts.init(histogramRef.value)
  
  // 计算直方图数据
  const values = measurementData.value.map(d => parseFloat(d.value))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binCount = 15
  const binWidth = (max - min) / binCount
  
  const bins = Array(binCount).fill(0)
  const binLabels = []
  
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth
    const binEnd = min + (i + 1) * binWidth
    binLabels.push(`${binStart.toFixed(3)}-${binEnd.toFixed(3)}`)
    
    values.forEach(value => {
      if (value >= binStart && value < binEnd) {
        bins[i]++
      }
    })
  }
  
  const option = {
    title: {
      text: '直方图与正态分布拟合',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['频次', '正态分布', '规格限'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: binLabels,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '频次',
        type: 'bar',
        data: bins,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  // 添加规格限线
  if (analysisConfig.usl || analysisConfig.lsl) {
    option.series.push({
      name: '规格限',
      type: 'line',
      markLine: {
        data: [
          ...(analysisConfig.usl ? [{
            xAxis: analysisConfig.usl,
            lineStyle: { color: '#F56C6C', type: 'dashed' },
            label: { formatter: 'USL' }
          }] : []),
          ...(analysisConfig.lsl ? [{
            xAxis: analysisConfig.lsl,
            lineStyle: { color: '#F56C6C', type: 'dashed' },
            label: { formatter: 'LSL' }
          }] : [])
        ]
      }
    })
  }
  
  histogramInstance.setOption(option)
}

const createProbabilityPlot = () => {
  if (probabilityInstance) {
    probabilityInstance.dispose()
  }
  
  probabilityInstance = echarts.init(probabilityRef.value)
  
  // 生成概率图数据
  const values = measurementData.value.map(d => parseFloat(d.value)).sort((a, b) => a - b)
  const n = values.length
  const probabilities = values.map((_, i) => (i + 0.5) / n * 100)
  
  const option = {
    title: {
      text: '正态概率图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'value',
      name: '测量值'
    },
    yAxis: {
      type: 'value',
      name: '累积概率(%)'
    },
    series: [
      {
        name: '实际数据',
        type: 'scatter',
        data: values.map((value, index) => [value, probabilities[index]]),
        symbolSize: 6,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '理论直线',
        type: 'line',
        data: [[values[0], 0], [values[n-1], 100]],
        lineStyle: {
          color: '#F56C6C',
          type: 'dashed'
        }
      }
    ]
  }
  
  probabilityInstance.setOption(option)
}

const getCapabilityClass = (value) => {
  const numValue = parseFloat(value)
  if (numValue >= 1.33) return 'excellent'
  if (numValue >= 1.0) return 'good'
  if (numValue >= 0.67) return 'fair'
  return 'poor'
}

const getCapabilityDesc = (type, value) => {
  const numValue = parseFloat(value)
  if (numValue >= 1.33) return '优秀'
  if (numValue >= 1.0) return '良好'
  if (numValue >= 0.67) return '一般'
  return '需改进'
}

const getValueClass = (value) => {
  const numValue = parseFloat(value)
  if (analysisConfig.usl && numValue > analysisConfig.usl) return 'over-limit'
  if (analysisConfig.lsl && numValue < analysisConfig.lsl) return 'under-limit'
  return 'normal'
}

const getDeviationClass = (deviation) => {
  const numValue = parseFloat(deviation)
  if (numValue > 0) return 'positive'
  if (numValue < 0) return 'negative'
  return 'zero'
}

const getStatusType = (status) => {
  const types = {
    '合格': 'success',
    '超上限': 'danger',
    '超下限': 'danger'
  }
  return types[status] || 'info'
}

const getPriorityType = (priority) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[priority] || 'info'
}

const exportChart = (type) => {
  ElMessage.success(`导出${type === 'histogram' ? '直方图' : '概率图'}功能开发中`)
}

const importData = () => {
  ElMessage.info('导入数据功能开发中')
}

const exportData = () => {
  ElMessage.success('导出数据功能开发中')
}

onMounted(() => {
  console.log('过程能力分析页面已加载')
})
</script>

<style lang="scss" scoped>
.capability-analysis {
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
  .capability-indices,
  .statistics-summary,
  .defect-prediction,
  .histogram-card,
  .probability-card,
  .data-table,
  .recommendations-card {
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
    
    .table-actions {
      display: flex;
      gap: 8px;
    }
  }

  .indices-content {
    .index-item {
      padding: 16px 0;
      border-bottom: 1px solid #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .index-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
      
      .index-value {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;
        
        &.excellent {
          color: #67c23a;
        }
        
        &.good {
          color: #409eff;
        }
        
        &.fair {
          color: #e6a23c;
        }
        
        &.poor {
          color: #f56c6c;
        }
      }
      
      .index-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .summary-content,
  .prediction-content {
    .summary-item,
    .prediction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .summary-label,
      .prediction-label {
        color: #606266;
        font-size: 14px;
      }
      
      .summary-value,
      .prediction-value {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        
        &.critical {
          color: #f56c6c;
        }
        
        &.success {
          color: #67c23a;
        }
      }
    }
  }

  .chart-container {
    padding: 10px;
  }

  .recommendation-item {
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background-color: #fff;
    height: 100%;
    
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
    
    .recommendation-desc {
      margin-bottom: 16px;
      color: #606266;
      line-height: 1.6;
    }
    
    .recommendation-actions {
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
          font-size: 14px;
        }
      }
    }
  }

  .over-limit {
    color: #f56c6c;
  }

  .under-limit {
    color: #f56c6c;
  }

  .normal {
    color: #303133;
  }

  .positive {
    color: #f56c6c;
  }

  .negative {
    color: #409eff;
  }

  .zero {
    color: #909399;
  }
}
