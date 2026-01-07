<template>
  <div class="incoming-inspection">
    <div class="page-header">
      <h2>来料检验管理</h2>
      <p>对原材料和外购件进行质量检验，确保来料符合质量标准</p>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <i class="el-icon-plus"></i> 新建检验单
        </el-button>
        <el-button @click="batchImport">
          <i class="el-icon-upload2"></i> 批量导入
        </el-button>
        <el-button @click="exportData">
          <i class="el-icon-download"></i> 导出数据
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索检验单号、供应商..."
          prefix-icon="el-icon-search"
          style="width: 300px;"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statsData" :key="index">
          <div class="stat-card" :class="stat.type">
            <div class="stat-icon">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="检验状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="待检验" value="pending"></el-option>
            <el-option label="检验中" value="inspecting"></el-option>
            <el-option label="合格" value="passed"></el-option>
            <el-option label="不合格" value="failed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="filterForm.supplier" placeholder="全部供应商" clearable>
            <el-option label="浙江精密制造" value="supplier1"></el-option>
            <el-option label="上海电气配件" value="supplier2"></el-option>
            <el-option label="江苏优质材料" value="supplier3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="检验日期">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 检验单列表 -->
    <div class="table-section">
      <el-table
        :data="inspectionList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="inspectionNo" label="检验单号" width="150" />
        <el-table-column prop="materialName" label="物料名称" width="200" />
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="inspector" label="检验员" width="100" />
        <el-table-column prop="inspectionDate" label="检验日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="合格率" width="100">
          <template #default="{ row }">
            <span :class="getPassRateClass(row.passRate)">{{ row.passRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="viewDetail(row)">查看</el-button>
            <el-button type="text" @click="editInspection(row)" v-if="row.status === 'pending'">编辑</el-button>
            <el-button type="text" @click="startInspection(row)" v-if="row.status === 'pending'">开始检验</el-button>
            <el-button type="text" @click="generateReport(row)" v-if="row.status === 'passed' || row.status === 'failed'">报告</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </div>

    <!-- 新建检验单对话框 -->
    <el-dialog
      title="新建来料检验单"
      :visible.sync="showCreateDialog"
      width="800px"
      @close="resetCreateForm"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料名称" prop="materialName">
              <el-select v-model="createForm.materialName" placeholder="选择物料" filterable>
                <el-option label="不锈钢管" value="不锈钢管"></el-option>
                <el-option label="电机轴承" value="电机轴承"></el-option>
                <el-option label="密封圈" value="密封圈"></el-option>
                <el-option label="控制芯片" value="控制芯片"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料编码" prop="materialCode">
              <el-input v-model="createForm.materialCode" placeholder="自动生成" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-select v-model="createForm.supplier" placeholder="选择供应商">
                <el-option label="浙江精密制造" value="浙江精密制造"></el-option>
                <el-option label="上海电气配件" value="上海电气配件"></el-option>
                <el-option label="江苏优质材料" value="江苏优质材料"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="createForm.batchNo" placeholder="输入批次号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="createForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="createForm.unit" placeholder="选择单位">
                <el-option label="个" value="个"></el-option>
                <el-option label="件" value="件"></el-option>
                <el-option label="套" value="套"></el-option>
                <el-option label="kg" value="kg"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验员" prop="inspector">
              <el-select v-model="createForm.inspector" placeholder="选择检验员">
                <el-option label="张工" value="张工"></el-option>
                <el-option label="李工" value="李工"></el-option>
                <el-option label="王工" value="王工"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划检验日期" prop="plannedDate">
              <el-date-picker
                v-model="createForm.plannedDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            placeholder="输入备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createInspection">确定</el-button>
      </div>
    </el-dialog>

    <!-- 检验详情对话框 -->
    <el-dialog
      title="检验详情"
      :visible.sync="showDetailDialog"
      width="1000px"
    >
      <div class="detail-content" v-if="currentDetail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="检验单号">{{ currentDetail.inspectionNo }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ currentDetail.materialName }}</el-descriptions-item>
          <el-descriptions-item label="物料编码">{{ currentDetail.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentDetail.supplier }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentDetail.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ currentDetail.quantity }} {{ currentDetail.unit }}</el-descriptions-item>
          <el-descriptions-item label="检验员">{{ currentDetail.inspector }}</el-descriptions-item>
          <el-descriptions-item label="检验日期">{{ currentDetail.inspectionDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="inspection-items" style="margin-top: 20px;">
          <h4>检验项目</h4>
          <el-table :data="currentDetail.inspectionItems" border>
            <el-table-column prop="itemName" label="检验项目" />
            <el-table-column prop="standard" label="标准要求" />
            <el-table-column prop="actualValue" label="实测值" />
            <el-table-column prop="result" label="结果">
              <template #default="{ row }">
                <el-tag :type="row.result === '合格' ? 'success' : 'danger'">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'IncomingInspection',
  setup() {
    const loading = ref(false)
    const searchKeyword = ref('')
    const showCreateDialog = ref(false)
    const showDetailDialog = ref(false)
    const currentDetail = ref(null)
    const selectedItems = ref([])
    
    // 分页
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)

    // 统计数据
    const statsData = ref([
      {
        label: '待检验',
        value: '15',
        icon: 'el-icon-time',
        type: 'warning'
      },
      {
        label: '检验中',
        value: '8',
        icon: 'el-icon-loading',
        type: 'primary'
      },
      {
        label: '合格',
        value: '142',
        icon: 'el-icon-success',
        type: 'success'
      },
      {
        label: '不合格',
        value: '3',
        icon: 'el-icon-error',
        type: 'danger'
      }
    ])

    // 筛选表单
    const filterForm = reactive({
      status: '',
      supplier: '',
      dateRange: []
    })

    // 新建表单
    const createForm = reactive({
      materialName: '',
      materialCode: '',
      supplier: '',
      batchNo: '',
      quantity: 1,
      unit: '',
      inspector: '',
      plannedDate: '',
      remark: ''
    })

    const createRules = {
      materialName: [{ required: true, message: '请选择物料名称', trigger: 'change' }],
      supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
      batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
      quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
      unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
      inspector: [{ required: true, message: '请选择检验员', trigger: 'change' }],
      plannedDate: [{ required: true, message: '请选择计划检验日期', trigger: 'change' }]
    }

    // 检验单列表
    const inspectionList = ref([
      {
        id: 1,
        inspectionNo: 'IQC20240106001',
        materialName: '不锈钢管',
        materialCode: 'M001',
        supplier: '浙江精密制造',
        batchNo: 'B20240106001',
        quantity: 100,
        unit: '根',
        inspector: '张工',
        inspectionDate: '2024-01-06',
        status: 'passed',
        passRate: 98.5,
        inspectionItems: [
          { itemName: '外观检查', standard: '无划痕、无变形', actualValue: '合格', result: '合格', remark: '' },
          { itemName: '尺寸测量', standard: 'Φ25±0.1mm', actualValue: 'Φ25.05mm', result: '合格', remark: '' },
          { itemName: '材质检验', standard: '304不锈钢', actualValue: '304不锈钢', result: '合格', remark: '' }
        ]
      },
      {
        id: 2,
        inspectionNo: 'IQC20240106002',
        materialName: '电机轴承',
        materialCode: 'M002',
        supplier: '上海电气配件',
        batchNo: 'B20240106002',
        quantity: 50,
        unit: '个',
        inspector: '李工',
        inspectionDate: '2024-01-06',
        status: 'inspecting',
        passRate: 0,
        inspectionItems: []
      },
      {
        id: 3,
        inspectionNo: 'IQC20240106003',
        materialName: '密封圈',
        materialCode: 'M003',
        supplier: '江苏优质材料',
        batchNo: 'B20240106003',
        quantity: 200,
        unit: '个',
        inspector: '王工',
        inspectionDate: '2024-01-06',
        status: 'failed',
        passRate: 85.5,
        inspectionItems: [
          { itemName: '硬度测试', standard: '70±5 Shore A', actualValue: '68 Shore A', result: '不合格', remark: '硬度偏低' },
          { itemName: '尺寸检查', standard: 'Φ30±0.2mm', actualValue: 'Φ30.1mm', result: '合格', remark: '' }
        ]
      }
    ])

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        'pending': 'warning',
        'inspecting': 'primary',
        'passed': 'success',
        'failed': 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        'pending': '待检验',
        'inspecting': '检验中',
        'passed': '合格',
        'failed': '不合格'
      }
      return textMap[status] || '未知'
    }

    // 获取合格率样式
    const getPassRateClass = (rate) => {
      if (rate >= 95) return 'pass-rate-high'
      if (rate >= 85) return 'pass-rate-medium'
      return 'pass-rate-low'
    }

    // 搜索处理
    const handleSearch = () => {
      console.log('搜索:', searchKeyword.value)
    }

    // 筛选处理
    const applyFilter = () => {
      console.log('应用筛选:', filterForm)
    }

    // 重置筛选
    const resetFilter = () => {
      Object.keys(filterForm).forEach(key => {
        filterForm[key] = key === 'dateRange' ? [] : ''
      })
    }

    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedItems.value = selection
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
    }

    // 查看详情
    const viewDetail = (row) => {
      currentDetail.value = row
      showDetailDialog.value = true
    }

    // 编辑检验单
    const editInspection = (row) => {
      console.log('编辑检验单:', row)
    }

    // 开始检验
    const startInspection = (row) => {
      console.log('开始检验:', row)
    }

    // 生成报告
    const generateReport = (row) => {
      console.log('生成报告:', row)
    }

    // 批量导入
    const batchImport = () => {
      console.log('批量导入')
    }

    // 导出数据
    const exportData = () => {
      console.log('导出数据')
    }

    // 创建检验单
    const createInspection = () => {
      console.log('创建检验单:', createForm)
      showCreateDialog.value = false
    }

    // 重置创建表单
    const resetCreateForm = () => {
      Object.keys(createForm).forEach(key => {
        createForm[key] = key === 'quantity' ? 1 : ''
      })
    }

    onMounted(() => {
      total.value = inspectionList.value.length
    })

    return {
      loading,
      searchKeyword,
      showCreateDialog,
      showDetailDialog,
      currentDetail,
      selectedItems,
      currentPage,
      pageSize,
      total,
      statsData,
      filterForm,
      createForm,
      createRules,
      inspectionList,
      getStatusType,
      getStatusText,
      getPassRateClass,
      handleSearch,
      applyFilter,
      resetFilter,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      viewDetail,
      editInspection,
      startInspection,
      generateReport,
      batchImport,
      exportData,
      createInspection,
      resetCreateForm
    }
  }
}
</script>

<style lang="scss" scoped>
.incoming-inspection {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    
    h2 {
      color: #303133;
      margin-bottom: 8px;
    }
    
    p {
      color: #606266;
      margin: 0;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        i {
          font-size: 24px;
          color: white;
        }
      }

      .stat-content {
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #606266;
        }
      }

      &.warning .stat-icon {
        background: #E6A23C;
      }

      &.primary .stat-icon {
        background: #409EFF;
      }

      &.success .stat-icon {
        background: #67C23A;
      }

      &.danger .stat-icon {
        background: #F56C6C;
      }
    }
  }

  .filter-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .table-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;

    .pagination {
      margin-top: 20px;
      text-align: right;
    }
  }

  .detail-content {
    .inspection-items {
      h4 {
        color: #303133;
        margin-bottom: 15px;
      }
    }
  }

  .pass-rate-high {
    color: #67C23A;
    font-weight: bold;
  }

  .pass-rate-medium {
    color: #E6A23C;
    font-weight: bold;
  }

  .pass-rate-low {
    color: #F56C6C;
    font-weight: bold;
  }
}
</style>
