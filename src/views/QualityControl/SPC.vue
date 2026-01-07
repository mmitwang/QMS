<template>
  <div class="spc-control">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>SPC统计过程控制</h2>
      <p>通过统计方法监控和控制生产过程质量</p>
    </div>

    <!-- 控制图选择 -->
    <el-card class="chart-selector">
      <template #header>
        <div class="card-header">
          <span>控制图类型</span>
          <el-button type="primary" @click="handleAddChart">
            <el-icon><Plus /></el-icon>
            新建控制图
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card 
            class="chart-type-card" 
            :class="{ active: selectedChartType === 'xbar-r' }"
            @click="selectChartType('xbar-r')"
          >
            <div class="chart-type-content">
              <div class="chart-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="chart-info">
                <div class="chart-name">X̄-R控制图</div>
                <div class="chart-desc">均值-极差控制图</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card 
            class="chart-type-card" 
            :class="{ active: selectedChartType === 'xbar-s' }"
            @click="selectChartType('xbar-s')"
          >
            <div class="chart-type-content">
              <div class="chart-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="chart-info">
                <div class="chart-name">X̄-S控制图</div>
                <div class="chart-desc">均值-标准差控制图</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card 
            class="chart-type-card" 
            :class="{ active: selectedChartType === 'p' }"
            @click="selectChartType('p')"
          >
            <div class="chart-type-content">
              <div class="chart-icon">
                <el-icon><PieChart /></el-icon>
              </div>
              <div class="chart-info">
                <div class="chart-name">P控制图</div>
                <div class="chart-desc">不合格品率控制图</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card 
            class="chart-type-card" 
            :class="{ active: selectedChartType === 'c' }"
            @click="selectChartType('c')"
          >
            <div class="chart-type-content">
              <div class="chart-icon">
                <el-icon><DataBoard /></el-icon>
              </div>
              <div class="chart-info">
                <div class="chart-name">C控制图</div>
                <div class="chart-desc">缺陷数控制图</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 控制图参数设置 -->
    <el-card class="chart-params" v-if="selectedChartType">
      <template #header>
        <div class="card-header">
          <span>控制图参数设置</span>
        </div>
      </template>
      <el-form :model="chartParams" :rules="paramRules" ref="paramFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="chartParams.productName" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工序名称" prop="processName">
              <el-input v-model="chartParams.processName" placeholder="请输入工序名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="质量特性" prop="qualityChar">
              <el-input v-model="chartParams.qualityChar" placeholder="请输入质量特性" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="样本大小" prop="sampleSize">
              <el-input-number v-model="chartParams.sampleSize" :min="1" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="控制限系数" prop="controlFactor">
              <el-input-number v-model="chartParams.controlFactor" :min="1" :max="5" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数据收集频率" prop="frequency">
              <el-select v-model="chartParams.frequency" placeholder="选择频率" style="width: 100%">
                <el-option label="每小时" value="hourly"></el-option>
                <el-option label="每班次" value="shift"></el-option>
                <el-option label="每天" value="daily"></el-option>
                <el-option label="每周" value="weekly"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" @click="generateChart">生成控制图</el-button>
              <el-button @click="resetParams">重置参数</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 控制图显示 -->
    <el-card class="chart-display" v-if="showChart">
      <template #header>
        <div class="card-header">
          <span>{{ getChartTitle() }}</span>
          <div class="chart-actions">
            <el-button size="small" @click="addDataPoint">
              <el-icon><Plus /></el-icon>
              添加数据点
            </el-button>
            <el-button size="small" @click="exportChart">
              <el-icon><Download /></el-icon>
              导出图表
            </el-button>
            <el-button size="small" @click="printChart">
              <el-icon><Printer /></el-icon>
              打印
            </el-button>
          </div>
        </div>
      </template>
      <div class="chart-container">
        <div ref="chartRef" style="width: 100%; height: 400px;"></div>
      </div>
      
      <!-- 控制图统计信息 -->
      <div class="chart-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">中心线(CL)</div>
              <div class="stat-value">{{ chartStats.centerLine }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">上控制限(UCL)</div>
              <div class="stat-value">{{ chartStats.upperLimit }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">下控制限(LCL)</div>
              <div class="stat-value">{{ chartStats.lowerLimit }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">过程能力指数(Cp)</div>
              <div class="stat-value">{{ chartStats.cpIndex }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 数据输入表格 -->
    <el-card class="data-input" v-if="showChart">
      <template #header>
        <div class="card-header">
          <span>数据输入</span>
          <el-button type="primary" size="small" @click="addDataRow">
            <el-icon><Plus /></el-icon>
            添加数据行
          </el-button>
        </div>
      </template>
      <el-table :data="dataPoints" style="width: 100%">
        <el-table-column prop="sampleNo" label="样本号" width="80" />
        <el-table-column prop="datetime" label="采集时间" width="150">
          <template #default="scope">
            <el-date-picker
              v-model="scope.row.datetime"
              type="datetime"
              placeholder="选择时间"
              size="small"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column 
          v-for="i in chartParams.sampleSize" 
          :key="i" 
          :label="`X${i}`" 
          width="80"
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.values[i-1]"
              :precision="2"
              size="small"
              style="width: 100%"
              @change="calculateRowStats(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="mean" label="均值" width="80">
          <template #default="scope">
            <span>{{ scope.row.mean?.toFixed(2) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="range" label="极差" width="80">
          <template #default="scope">
            <span>{{ scope.row.range?.toFixed(2) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status || '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="primary" @click="updateChart">更新图表</el-button>
            <el-button size="small" type="danger" @click="removeDataRow(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 异常分析 -->
    <el-card class="anomaly-analysis" v-if="showChart && anomalies.length > 0">
      <template #header>
        <div class="card-header">
          <span>异常点分析</span>
          <el-badge :value="anomalies.length" class="anomaly-badge" />
        </div>
      </template>
      <el-table :data="anomalies" style="width: 100%">
        <el-table-column prop="sampleNo" label="样本号" width="80" />
        <el-table-column prop="datetime" label="时间" width="150" />
        <el-table-column prop="value" label="数值" width="100" />
        <el-table-column prop="type" label="异常类型" width="120">
          <template #default="scope">
            <el-tag :type="getAnomalyType(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleAnomaly(scope.row)">处理</el-button>
            <el-button size="small" type="warning" @click="markFalseAlarm(scope.row)">误报</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建控制图对话框 -->
    <el-dialog v-model="chartDialogVisible" title="新建控制图" width="60%">
      <el-form :model="newChartForm" :rules="chartRules" ref="chartFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图表名称" prop="name">
              <el-input v-model="newChartForm.name" placeholder="请输入图表名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图表类型" prop="type">
              <el-select v-model="newChartForm.type" placeholder="选择图表类型" style="width: 100%">
                <el-option label="X̄-R控制图" value="xbar-r"></el-option>
                <el-option label="X̄-S控制图" value="xbar-s"></el-option>
                <el-option label="P控制图" value="p"></el-option>
                <el-option label="C控制图" value="c"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品线" prop="productLine">
              <el-select v-model="newChartForm.productLine" placeholder="选择产品线" style="width: 100%">
                <el-option label="产品线A" value="A"></el-option>
                <el-option label="产品线B" value="B"></el-option>
                <el-option label="产品线C" value="C"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="owner">
              <el-select v-model="newChartForm.owner" placeholder="选择负责人" style="width: 100%">
                <el-option label="张三" value="张三"></el-option>
                <el-option label="李四" value="李四"></el-option>
                <el-option label="王五" value="王五"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="newChartForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入图表描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="chartDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createChart">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加数据点对话框 -->
    <el-dialog v-model="dataDialogVisible" title="添加数据点" width="50%">
      <el-form :model="newDataForm" label-width="120px">
        <el-form-item label="采集时间">
          <el-date-picker
            v-model="newDataForm.datetime"
            type="datetime"
            placeholder="选择采集时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="测量值">
          <el-row :gutter="10">
            <el-col :span="8" v-for="i in chartParams.sampleSize" :key="i">
              <el-input-number
                v-model="newDataForm.values[i-1]"
                :placeholder="`X${i}`"
                :precision="2"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="newDataForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dataDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addNewDataPoint">添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Plus,
  Download,
  Printer,
  TrendCharts,
  DataLine,
  PieChart,
  DataBoard
} from '@element-plus/icons-vue'

// 响应式数据
const selectedChartType = ref('')
const showChart = ref(false)
const chartDialogVisible = ref(false)
const dataDialogVisible = ref(false)
const chartRef = ref()
let chartInstance = null

const chartParams = reactive({
  productName: '',
  processName: '',
  qualityChar: '',
  sampleSize: 5,
  controlFactor: 3,
  frequency: 'hourly'
})

const paramRules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  processName: [{ required: true, message: '请输入工序名称', trigger: 'blur' }],
  qualityChar: [{ required: true, message: '请输入质量特性', trigger: 'blur' }]
}

const chartStats = reactive({
  centerLine: 0,
  upperLimit: 0,
  lowerLimit: 0,
  cpIndex: 0
})

const dataPoints = ref([])
const anomalies = ref([])

const newChartForm = reactive({
  name: '',
  type: '',
  productLine: '',
  owner: '',
  description: ''
})

const chartRules = {
  name: [{ required: true, message: '请输入图表名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择图表类型', trigger: 'change' }],
  productLine: [{ required: true, message: '请选择产品线', trigger: 'change' }],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

const newDataForm = reactive({
  datetime: new Date(),
  values: [],
  remark: ''
})

const paramFormRef = ref()
const chartFormRef = ref()

// 方法
const selectChartType = (type) => {
  selectedChartType.value = type
  showChart.value = false
}

const getChartTitle = () => {
  const titles = {
    'xbar-r': 'X̄-R控制图',
    'xbar-s': 'X̄-S控制图',
    'p': 'P控制图',
    'c': 'C控制图'
  }
  return titles[selectedChartType.value] || '控制图'
}

const generateChart = () => {
  paramFormRef.value?.validate((valid) => {
    if (valid) {
      showChart.value = true
      initializeDataPoints()
      nextTick(() => {
        createChartInstance()
      })
      ElMessage.success('控制图生成成功')
    }
  })
}

const resetParams = () => {
  Object.assign(chartParams, {
    productName: '',
    processName: '',
    qualityChar: '',
    sampleSize: 5,
    controlFactor: 3,
    frequency: 'hourly'
  })
}

const initializeDataPoints = () => {
  dataPoints.value = []
  for (let i = 1; i <= 10; i++) {
    const values = Array(chartParams.sampleSize).fill(0).map(() => 
      Math.round((Math.random() * 10 + 95) * 100) / 100
    )
    dataPoints.value.push({
      sampleNo: i,
      datetime: new Date(Date.now() - (10 - i) * 3600000),
      values: values,
      mean: 0,
      range: 0,
      status: '正常'
    })
    calculateRowStats(dataPoints.value[i - 1])
  }
}

const calculateRowStats = (row) => {
  if (row.values.every(v => v !== null && v !== undefined)) {
    row.mean = row.values.reduce((sum, val) => sum + val, 0) / row.values.length
    row.range = Math.max(...row.values) - Math.min(...row.values)
    
    // 检查异常点
    checkAnomalies(row)
  }
}

const checkAnomalies = (row) => {
  // 简单的异常检测逻辑
  if (row.mean > chartStats.upperLimit || row.mean < chartStats.lowerLimit) {
    row.status = '异常'
    anomalies.value.push({
      sampleNo: row.sampleNo,
      datetime: row.datetime,
      value: row.mean,
      type: row.mean > chartStats.upperLimit ? '超上限' : '超下限',
      description: `均值${row.mean.toFixed(2)}超出控制限`
    })
  }
}

const createChartInstance = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  
  // 计算控制限
  const means = dataPoints.value.map(d => d.mean).filter(m => m)
  const overallMean = means.reduce((sum, val) => sum + val, 0) / means.length
  const ranges = dataPoints.value.map(d => d.range).filter(r => r)
  const avgRange = ranges.reduce((sum, val) => sum + val, 0) / ranges.length
  
  chartStats.centerLine = overallMean
  chartStats.upperLimit = overallMean + (chartParams.controlFactor * avgRange / 2.326)
  chartStats.lowerLimit = overallMean - (chartParams.controlFactor * avgRange / 2.326)
  chartStats.cpIndex = 1.33 // 示例值
  
  const option = {
    title: {
      text: getChartTitle(),
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['均值', '上控制限', '下控制限', '中心线'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: dataPoints.value.map(d => d.sampleNo)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '均值',
        type: 'line',
        data: means,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '上控制限',
        type: 'line',
        data: Array(means.length).fill(chartStats.upperLimit),
        lineStyle: {
          color: '#F56C6C',
          type: 'dashed'
        },
        symbol: 'none'
      },
      {
        name: '下控制限',
        type: 'line',
        data: Array(means.length).fill(chartStats.lowerLimit),
        lineStyle: {
          color: '#F56C6C',
          type: 'dashed'
        },
        symbol: 'none'
      },
      {
        name: '中心线',
        type: 'line',
        data: Array(means.length).fill(chartStats.centerLine),
        lineStyle: {
          color: '#67C23A',
          type: 'solid'
        },
        symbol: 'none'
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const updateChart = () => {
  if (chartInstance) {
    createChartInstance()
    ElMessage.success('图表已更新')
  }
}

const addDataRow = () => {
  const newRow = {
    sampleNo: dataPoints.value.length + 1,
    datetime: new Date(),
    values: Array(chartParams.sampleSize).fill(0),
    mean: 0,
    range: 0,
    status: '正常'
  }
  dataPoints.value.push(newRow)
}

const removeDataRow = (index) => {
  dataPoints.value.splice(index, 1)
  // 重新编号
  dataPoints.value.forEach((row, idx) => {
    row.sampleNo = idx + 1
  })
}

const getStatusType = (status) => {
  return status === '异常' ? 'danger' : 'success'
}

const getAnomalyType = (type) => {
  const types = {
    '超上限': 'danger',
    '超下限': 'warning',
    '连续偏移': 'info'
  }
  return types[type] || 'info'
}

const handleAddChart = () => {
  chartDialogVisible.value = true
}

const createChart = () => {
  chartFormRef.value?.validate((valid) => {
    if (valid) {
      console.log('创建图表', newChartForm)
      ElMessage.success('图表创建成功')
      chartDialogVisible.value = false
    }
  })
}

const addDataPoint = () => {
  newDataForm.values = Array(chartParams.sampleSize).fill(0)
  dataDialogVisible.value = true
}

const addNewDataPoint = () => {
  const newPoint = {
    sampleNo: dataPoints.value.length + 1,
    datetime: newDataForm.datetime,
    values: [...newDataForm.values],
    mean: 0,
    range: 0,
    status: '正常'
  }
  calculateRowStats(newPoint)
  dataPoints.value.push(newPoint)
  dataDialogVisible.value = false
  ElMessage.success('数据点添加成功')
}

const exportChart = () => {
  ElMessage.success('导出功能开发中')
}

const printChart = () => {
  ElMessage.success('打印功能开发中')
}

const handleAnomaly = (anomaly) => {
  ElMessage.info('异常处理功能开发中')
}

const markFalseAlarm = (anomaly) => {
  ElMessage.warning('标记误报功能开发中')
}

onMounted(() => {
  console.log('SPC统计过程控制页面已加载')
})
</script>

<style lang="scss" scoped>
.spc-control {
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

  .chart-selector,
  .chart-params,
  .chart-display,
  .data-input,
  .anomaly-analysis {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .chart-type-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    
    &:hover {
      box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
    
    &.active {
      border-color: #409eff;
      box-shadow: 0 4px 20px 0 rgba(64, 158, 255, 0.3);
    }
    
    .chart-type-content {
      display: flex;
      align-items: center;
      
      .chart-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #ecf5ff;
        color: #409eff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
      }
      
      .chart-info {
        .chart-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .chart-desc {
          font-size: 12px;
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
      gap: 8px;
    }
  }

  .chart-container {
    margin-bottom: 20px;
  }

  .chart-stats {
    padding: 20px;
    background-color: #fafafa;
    border-radius: 4px;
    
    .stat-item {
      text-align: center;
      
      .stat-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .anomaly-badge {
    margin-left: 8px;
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

  :deep(.el-dialog) {
    .el-dialog__body {
      padding: 20px;
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}
</style>
