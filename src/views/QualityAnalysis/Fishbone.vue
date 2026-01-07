<template>
  <div class="fishbone-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>鱼骨图分析</h2>
      <p>运用因果分析法系统分析质量问题的根本原因</p>
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
            <el-form-item label="问题描述" prop="problemDescription">
              <el-input 
                v-model="analysisConfig.problemDescription" 
                placeholder="请输入要分析的质量问题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分析方法" prop="analysisMethod">
              <el-select v-model="analysisConfig.analysisMethod" placeholder="选择分析方法" style="width: 100%">
                <el-option label="4M分析法" value="4m"></el-option>
                <el-option label="5M1E分析法" value="5m1e"></el-option>
                <el-option label="8M分析法" value="8m"></el-option>
                <el-option label="自定义分类" value="custom"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分析团队" prop="analysisTeam">
              <el-select v-model="analysisConfig.analysisTeam" placeholder="选择分析团队" multiple style="width: 100%">
                <el-option label="质量工程师" value="qe"></el-option>
                <el-option label="工艺工程师" value="pe"></el-option>
                <el-option label="生产主管" value="pm"></el-option>
                <el-option label="设备工程师" value="ee"></el-option>
                <el-option label="检验员" value="inspector"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 鱼骨图 -->
    <el-card class="fishbone-card" v-if="showAnalysis">
      <template #header>
        <div class="card-header">
          <span>鱼骨图</span>
          <div class="chart-actions">
            <el-button size="small" @click="editFishbone">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" @click="exportFishbone">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>
      <div class="fishbone-container">
        <div ref="fishboneRef" class="fishbone-diagram">
          <!-- 鱼骨图SVG -->
          <svg width="100%" height="600" viewBox="0 0 1200 600">
            <!-- 主骨 -->
            <line x1="100" y1="300" x2="1000" y2="300" stroke="#409EFF" stroke-width="4"/>
            
            <!-- 问题框 -->
            <rect x="1000" y="250" width="180" height="100" fill="#F56C6C" stroke="#F56C6C" stroke-width="2" rx="10"/>
            <text x="1090" y="305" text-anchor="middle" fill="white" font-size="14" font-weight="bold">
              {{ analysisConfig.problemDescription || '质量问题' }}
            </text>
            
            <!-- 主要原因分类 -->
            <g v-for="(category, index) in fishboneCategories" :key="category.name">
              <!-- 上方分支 -->
              <g v-if="index % 2 === 0">
                <line 
                  :x1="200 + index * 150" 
                  :y1="300" 
                  :x2="200 + index * 150 - 80" 
                  :y2="200" 
                  stroke="#409EFF" 
                  stroke-width="3"
                />
                <rect 
                  :x="200 + index * 150 - 120" 
                  :y="170" 
                  width="80" 
                  height="30" 
                  :fill="category.color" 
                  stroke="#409EFF" 
                  rx="5"
                />
                <text 
                  :x="200 + index * 150 - 80" 
                  :y="190" 
                  text-anchor="middle" 
                  fill="white" 
                  font-size="12" 
                  font-weight="bold"
                >
                  {{ category.name }}
                </text>
                
                <!-- 次要原因 -->
                <g v-for="(cause, causeIndex) in category.causes" :key="cause">
                  <line 
                    :x1="200 + index * 150 - 20 - causeIndex * 25" 
                    :y1="220 + causeIndex * 5" 
                    :x2="200 + index * 150 - 40 - causeIndex * 25" 
                    :y2="200 + causeIndex * 5" 
                    stroke="#909399" 
                    stroke-width="2"
                  />
                  <text 
                    :x="200 + index * 150 - 45 - causeIndex * 25" 
                    :y="195 + causeIndex * 5" 
                    text-anchor="end" 
                    fill="#303133" 
                    font-size="10"
                  >
                    {{ cause }}
                  </text>
                </g>
              </g>
              
              <!-- 下方分支 -->
              <g v-else>
                <line 
                  :x1="200 + index * 150" 
                  :y1="300" 
                  :x2="200 + index * 150 - 80" 
                  :y2="400" 
                  stroke="#409EFF" 
                  stroke-width="3"
                />
                <rect 
                  :x="200 + index * 150 - 120" 
                  :y="400" 
                  width="80" 
                  height="30" 
                  :fill="category.color" 
                  stroke="#409EFF" 
                  rx="5"
                />
                <text 
                  :x="200 + index * 150 - 80" 
                  :y="420" 
                  text-anchor="middle" 
                  fill="white" 
                  font-size="12" 
                  font-weight="bold"
                >
                  {{ category.name }}
                </text>
                
                <!-- 次要原因 -->
                <g v-for="(cause, causeIndex) in category.causes" :key="cause">
                  <line 
                    :x1="200 + index * 150 - 20 - causeIndex * 25" 
                    :y1="380 - causeIndex * 5" 
                    :x2="200 + index * 150 - 40 - causeIndex * 25" 
                    :y2="400 - causeIndex * 5" 
                    stroke="#909399" 
                    stroke-width="2"
                  />
                  <text 
                    :x="200 + index * 150 - 45 - causeIndex * 25" 
                    :y="405 - causeIndex * 5" 
                    text-anchor="end" 
                    fill="#303133" 
                    font-size="10"
                  >
                    {{ cause }}
                  </text>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </el-card>

    <!-- 原因分析详情 -->
    <el-row :gutter="20" v-if="showAnalysis">
      <el-col :span="16">
        <!-- 原因分析表 -->
        <el-card class="causes-table">
          <template #header>
            <div class="card-header">
              <span>原因分析详情</span>
              <el-button size="small" @click="addCause">
                <el-icon><Plus /></el-icon>
                添加原因
              </el-button>
            </div>
          </template>
          <el-table :data="causesData" style="width: 100%">
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :color="getCategoryColor(scope.row.category)">
                  {{ scope.row.category }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cause" label="原因描述" width="200" />
            <el-table-column prop="level" label="影响程度" width="120">
              <template #default="scope">
                <el-rate v-model="scope.row.level" :max="5" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="probability" label="发生概率" width="100">
              <template #default="scope">
                <span>{{ scope.row.probability }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="evidence" label="证据/数据" width="150" />
            <el-table-column prop="action" label="改进措施" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" @click="editCause(scope.row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click="deleteCause(scope.$index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
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
              <div class="summary-label">主要分类</div>
              <div class="summary-value">{{ fishboneCategories.length }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">识别原因</div>
              <div class="summary-value">{{ causesData.length }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">高风险原因</div>
              <div class="summary-value critical">{{ highRiskCauses }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">中风险原因</div>
              <div class="summary-value important">{{ mediumRiskCauses }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">低风险原因</div>
              <div class="summary-value normal">{{ lowRiskCauses }}</div>
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

    <!-- 添加/编辑原因对话框 -->
    <el-dialog 
      v-model="causeDialogVisible" 
      :title="isEditMode ? '编辑原因' : '添加原因'"
      width="600px"
    >
      <el-form :model="causeForm" :rules="causeRules" ref="causeFormRef" label-width="100px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="causeForm.category" placeholder="选择分类" style="width: 100%">
            <el-option 
              v-for="cat in fishboneCategories" 
              :key="cat.name" 
              :label="cat.name" 
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="原因描述" prop="cause">
          <el-input 
            v-model="causeForm.cause" 
            type="textarea" 
            :rows="3"
            placeholder="请详细描述原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="影响程度" prop="level">
          <el-rate v-model="causeForm.level" :max="5" show-text />
        </el-form-item>
        <el-form-item label="发生概率" prop="probability">
          <el-slider v-model="causeForm.probability" :max="100" show-input />
        </el-form-item>
        <el-form-item label="证据/数据" prop="evidence">
          <el-input v-model="causeForm.evidence" placeholder="支持该原因的证据或数据" />
        </el-form-item>
        <el-form-item label="改进措施" prop="action">
          <el-input 
            v-model="causeForm.action" 
            type="textarea" 
            :rows="2"
            placeholder="针对该原因的改进措施"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="causeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCause">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  Download,
  Edit,
  Plus,
  Delete,
  Star
} from '@element-plus/icons-vue'

// 响应式数据
const showAnalysis = ref(false)
const causeDialogVisible = ref(false)
const isEditMode = ref(false)
const editingIndex = ref(-1)
const fishboneRef = ref()

const analysisConfig = reactive({
  problemDescription: '',
  analysisMethod: '',
  analysisTeam: []
})

const configRules = {
  problemDescription: [{ required: true, message: '请输入问题描述', trigger: 'blur' }],
  analysisMethod: [{ required: true, message: '请选择分析方法', trigger: 'change' }]
}

const causeForm = reactive({
  category: '',
  cause: '',
  level: 3,
  probability: 50,
  evidence: '',
  action: ''
})

const causeRules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  cause: [{ required: true, message: '请输入原因描述', trigger: 'blur' }],
  level: [{ required: true, message: '请评估影响程度', trigger: 'change' }]
}

const fishboneCategories = ref([
  { name: '人员', color: '#409EFF', causes: ['技能不足', '培训缺失', '责任心不强'] },
  { name: '机器', color: '#67C23A', causes: ['设备老化', '精度不够', '维护不当'] },
  { name: '材料', color: '#E6A23C', causes: ['质量不稳定', '规格不符', '供应商问题'] },
  { name: '方法', color: '#F56C6C', causes: ['工艺不当', '标准缺失', '流程混乱'] },
  { name: '环境', color: '#909399', causes: ['温湿度异常', '清洁度不够', '噪音干扰'] },
  { name: '测量', color: '#606266', causes: ['仪器误差', '校准不准', '方法错误'] }
])

const causesData = ref([])

const recommendations = ref([
  {
    id: 1,
    priority: 'high',
    title: '优先解决高风险原因',
    description: '重点关注影响程度高且发生概率大的原因，制定针对性改进措施'
  },
  {
    id: 2,
    priority: 'medium',
    title: '系统性改进',
    description: '从人机料法环测六个维度系统性地分析和改进'
  },
  {
    id: 3,
    priority: 'low',
    title: '持续监控',
    description: '建立长效机制，持续监控和预防问题的再次发生'
  }
])

const configFormRef = ref()
const causeFormRef = ref()

// 计算属性
const highRiskCauses = computed(() => 
  causesData.value.filter(cause => cause.level >= 4 && cause.probability >= 70).length
)

const mediumRiskCauses = computed(() => 
  causesData.value.filter(cause => 
    (cause.level >= 3 && cause.probability >= 50) && 
    !(cause.level >= 4 && cause.probability >= 70)
  ).length
)

const lowRiskCauses = computed(() => 
  causesData.value.filter(cause => 
    !((cause.level >= 3 && cause.probability >= 50))
  ).length
)

// 方法
const generateAnalysis = () => {
  configFormRef.value?.validate((valid) => {
    if (valid) {
      showAnalysis.value = true
      generateMockData()
      ElMessage.success('鱼骨图分析生成成功')
    }
  })
}

const generateMockData = () => {
  // 根据选择的分析方法调整分类
  if (analysisConfig.analysisMethod === '4m') {
    fishboneCategories.value = fishboneCategories.value.slice(0, 4)
  } else if (analysisConfig.analysisMethod === '5m1e') {
    fishboneCategories.value = fishboneCategories.value.slice(0, 6)
  }

  // 生成模拟原因数据
  causesData.value = [
    {
      category: '人员',
      cause: '操作员技能水平不足，对工艺要求理解不深',
      level: 4,
      probability: 75,
      evidence: '培训记录显示合格率仅60%',
      action: '加强技能培训，建立考核机制'
    },
    {
      category: '机器',
      cause: '设备精度下降，关键参数超出控制范围',
      level: 5,
      probability: 80,
      evidence: '设备检测报告显示精度偏差±0.05mm',
      action: '设备大修，更换关键部件'
    },
    {
      category: '材料',
      cause: '原材料质量波动，供应商管控不严',
      level: 3,
      probability: 60,
      evidence: '来料检验不合格率3.2%',
      action: '严格供应商审核，加强来料检验'
    },
    {
      category: '方法',
      cause: '作业指导书更新不及时，标准执行不一致',
      level: 4,
      probability: 70,
      evidence: '现场审核发现标准版本不统一',
      action: '更新作业指导书，统一标准执行'
    }
  ]
}

const addCause = () => {
  isEditMode.value = false
  resetCauseForm()
  causeDialogVisible.value = true
}

const editCause = (cause) => {
  isEditMode.value = true
  editingIndex.value = causesData.value.findIndex(c => c === cause)
  Object.assign(causeForm, cause)
  causeDialogVisible.value = true
}

const deleteCause = (index) => {
  ElMessageBox.confirm('确定要删除这个原因吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    causesData.value.splice(index, 1)
    ElMessage.success('删除成功')
  })
}

const saveCause = () => {
  causeFormRef.value?.validate((valid) => {
    if (valid) {
      if (isEditMode.value) {
        Object.assign(causesData.value[editingIndex.value], { ...causeForm })
        ElMessage.success('修改成功')
      } else {
        causesData.value.push({ ...causeForm })
        ElMessage.success('添加成功')
      }
      causeDialogVisible.value = false
    }
  })
}

const resetCauseForm = () => {
  Object.assign(causeForm, {
    category: '',
    cause: '',
    level: 3,
    probability: 50,
    evidence: '',
    action: ''
  })
}

const getCategoryColor = (category) => {
  const cat = fishboneCategories.value.find(c => c.name === category)
  return cat ? cat.color : '#909399'
}

const editFishbone = () => {
  ElMessage.info('鱼骨图编辑功能开发中')
}

const exportFishbone = () => {
  ElMessage.success('导出鱼骨图功能开发中')
}

onMounted(() => {
  console.log('鱼骨图分析页面已加载')
})
</script>

<style lang="scss" scoped>
.fishbone-analysis {
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
  .fishbone-card,
  .causes-table,
  .summary-card,
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
    
    .chart-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .fishbone-container {
    padding: 20px;
    background-color: #fafafa;
    border-radius: 8px;
    overflow-x: auto;
    
    .fishbone-diagram {
      min-width: 1200px;
    }
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

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
</style>
