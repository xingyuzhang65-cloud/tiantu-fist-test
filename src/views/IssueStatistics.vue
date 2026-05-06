<template>
  <div class="issue-statistics-container">
    <h2>问题件统计</h2>
    
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <!-- 运单号 -->
        <el-form-item label="运单号">
          <el-input
            v-model="searchForm.waybillNo"
            placeholder="支持批量（空格/逗号隔开）"
            style="width: 200px"
          />
        </el-form-item>
        
        <!-- 客户简称 -->
        <el-form-item label="客户简称">
          <el-select
            v-model="searchForm.customerName"
            multiple
            placeholder="请选择"
            style="width: 180px"
          >
            <el-option
              v-for="customer in customerOptions"
              :key="customer.value"
              :label="customer.label"
              :value="customer.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 问题件类型 -->
        <el-form-item label="问题件类型">
          <el-select
            v-model="searchForm.issueType"
            multiple
            placeholder="请选择"
            style="width: 180px"
          >
            <el-option
              v-for="type in issueTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 状态 -->
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            multiple
            placeholder="请选择"
            style="width: 180px"
          >
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 发起人 -->
        <el-form-item label="发起人">
          <el-select
            v-model="searchForm.initiator"
            multiple
            placeholder="请选择"
            style="width: 180px"
          >
            <el-option
              v-for="person in initiatorOptions"
              :key="person.value"
              :label="person.label"
              :value="person.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 业务员 -->
        <el-form-item label="业务员">
          <el-select
            v-model="searchForm.salesman"
            multiple
            placeholder="请选择"
            style="width: 180px"
          >
            <el-option
              v-for="person in salesmanOptions"
              :key="person.value"
              :label="person.label"
              :value="person.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 发起时间 -->
        <el-form-item label="发起时间">
          <el-date-picker
            v-model="searchForm.createTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        
        <!-- 快捷时间选择 -->
        <el-form-item>
          <el-button
            v-for="item in timeShortcuts"
            :key="item.value"
            @click="setTimeRange(item.value)"
            size="small"
            :type="activeTimeRange === item.value ? 'primary' : 'default'"
          >
            {{ item.label }}
          </el-button>
        </el-form-item>
        
        <!-- 搜索按钮 -->
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 报表区域 -->
    <div class="report-container">
      <!-- 问题件数量 -->
      <el-card class="report-card">
        <template #header>
          <div class="card-header">
            <span>问题件数量</span>
            <div class="card-actions">
              <el-button size="small" @click="exportPDF('count')">导出PDF</el-button>
              <el-button size="small" @click="exportExcel('count')">导出Excel</el-button>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div ref="countChartRef" class="chart"></div>
        </div>
        <div class="chart-table">
          <el-table :data="countTableData" border style="width: 100%">
            <el-table-column prop="date" label="日期" width="150" />
            <el-table-column prop="total" label="全部" />
            <el-table-column prop="pending" label="待审批" />
            <el-table-column prop="processing" label="审批中" />
            <el-table-column prop="rejected" label="审批驳回和取消" />
            <el-table-column prop="confirming" label="待确认" />
            <el-table-column prop="completed" label="审批完成" />
          </el-table>
        </div>
      </el-card>
      
      <!-- 问题件金额 -->
      <el-card class="report-card">
        <template #header>
          <div class="card-header">
            <span>问题件金额</span>
            <div class="card-actions">
              <el-button size="small" @click="exportPDF('amount')">导出PDF</el-button>
              <el-button size="small" @click="exportExcel('amount')">导出Excel</el-button>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div ref="amountChartRef" class="chart"></div>
        </div>
        <div class="chart-table">
          <el-table :data="amountTableData" border style="width: 100%">
            <el-table-column prop="date" label="日期" width="150" />
            <el-table-column prop="total" label="赔付客户金额" />
            <el-table-column prop="personalShare" label="个人分摊" />
            <el-table-column prop="companyShare" label="公司分摊" />
            <el-table-column prop="proxyCompensation" label="代理赔付" />
            <el-table-column prop="grossProfit" label="毛利润" />
          </el-table>
        </div>
      </el-card>
      
      <!-- 问题件类型 -->
      <el-card class="report-card">
        <template #header>
          <div class="card-header">
            <span>问题件类型</span>
            <div class="card-actions">
              <el-button size="small" @click="exportPDF('type')">导出PDF</el-button>
              <el-button size="small" @click="exportExcel('type')">导出Excel</el-button>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div ref="typeChartRef" class="chart"></div>
        </div>
        <div class="chart-table">
          <el-table :data="typeTableData" border style="width: 100%">
            <el-table-column prop="type" label="问题件类型" width="150" />
            <el-table-column prop="count" label="数量" />
            <el-table-column prop="percentage" label="占比" />
          </el-table>
        </div>
      </el-card>
      
      <!-- 问题件金额构成 -->
      <el-card class="report-card">
        <template #header>
          <div class="card-header">
            <span>问题件金额构成</span>
            <div class="card-actions">
              <el-button size="small" @click="exportPDF('composition')">导出PDF</el-button>
              <el-button size="small" @click="exportExcel('composition')">导出Excel</el-button>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div ref="compositionChartRef" class="chart"></div>
        </div>
        <div class="chart-table">
          <el-table :data="compositionTableData" border style="width: 100%">
            <el-table-column prop="type" label="类型" width="150" />
            <el-table-column prop="amount" label="金额" />
            <el-table-column prop="percentage" label="占比" />
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'

// 搜索表单
const searchForm = ref({
  waybillNo: '',
  customerName: [],
  issueType: [],
  status: [],
  initiator: [],
  salesman: [],
  createTime: []
})

// 时间快捷选项
const timeShortcuts = [
  { label: '今日', value: 'today' },
  { label: '昨日', value: 'yesterday' },
  { label: '近7天', value: '7days' },
  { label: '近30天', value: '30days' },
  { label: '本月', value: 'thisMonth' },
  { label: '上月', value: 'lastMonth' },
  { label: '今年', value: 'thisYear' },
  { label: '去年', value: 'lastYear' }
]

// 活动的时间范围
const activeTimeRange = ref('7days') // 默认近7天

// 下拉选项数据（模拟）
const customerOptions = ref([
  { label: '客户A', value: 'customerA' },
  { label: '客户B', value: 'customerB' },
  { label: '客户C', value: 'customerC' }
])

const issueTypeOptions = ref([
  { label: '职能问题件', value: 'function' },
  { label: '重量差', value: 'weight' },
  { label: '单价', value: 'price' },
  { label: '坏账', value: 'badDebt' },
  { label: '附加', value: 'additional' },
  { label: '索赔', value: 'claim' }
])

const statusOptions = ref([
  { label: '待审批', value: 'pending' },
  { label: '审批中', value: 'processing' },
  { label: '审批驳回和取消', value: 'rejected' },
  { label: '待确认', value: 'confirming' },
  { label: '审批完成', value: 'completed' }
])

const initiatorOptions = ref([
  { label: '用户1', value: 'user1' },
  { label: '用户2', value: 'user2' },
  { label: '用户3', value: 'user3' }
])

const salesmanOptions = ref([
  { label: '业务员1', value: 'sales1' },
  { label: '业务员2', value: 'sales2' },
  { label: '业务员3', value: 'sales3' }
])

// 图表引用
const countChartRef = ref(null)
const amountChartRef = ref(null)
const typeChartRef = ref(null)
const compositionChartRef = ref(null)

// 图表实例
let countChart = null
let amountChart = null
let typeChart = null
let compositionChart = null

// 表格数据
const countTableData = ref([])
const amountTableData = ref([])
const typeTableData = ref([])
const compositionTableData = ref([])

// 时间范围设置
const setTimeRange = (type) => {
  activeTimeRange.value = type
  const now = new Date()
  let start, end
  
  switch (type) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = now
      break
    case 'yesterday':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59)
      break
    case '7days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      end = now
      break
    case '30days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      end = now
      break
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = now
      break
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      break
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1)
      end = now
      break
    case 'lastYear':
      start = new Date(now.getFullYear() - 1, 0, 1)
      end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
      break
  }
  
  searchForm.value.createTime = [start, end]
  search()
}

// 搜索
const search = () => {
  // 模拟搜索请求
  console.log('搜索参数:', searchForm.value)
  // 加载模拟数据
  loadMockData()
  // 渲染图表
  renderCharts()
}

// 重置表单
const resetForm = () => {
  searchForm.value = {
    waybillNo: '',
    customerName: [],
    issueType: [],
    status: [],
    initiator: [],
    salesman: [],
    createTime: []
  }
  activeTimeRange.value = '7days' // 默认近7天
  setTimeRange('7days')
}

// 加载模拟数据
const loadMockData = () => {
  // 问题件数量数据
  const countData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(2026, 3, 20 - i)
    countData.push({
      date: date.toISOString().split('T')[0],
      total: 10 + i,
      pending: 2 + i,
      processing: 3 + i,
      rejected: 1 + i,
      confirming: 2 + i,
      completed: 2 + i
    })
  }
  countTableData.value = countData
  
  // 问题件金额数据
  const amountData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(2026, 3, 20 - i)
    const total = 10000 + i * 1000
    amountData.push({
      date: date.toISOString().split('T')[0],
      total: total,
      personalShare: total * 0.3,
      companyShare: total * 0.5,
      proxyCompensation: total * 0.2,
      grossProfit: total * 0.1
    })
  }
  amountTableData.value = amountData
  
  // 问题件类型数据
  const typeData = [
    { type: '职能问题件', count: 30 },
    { type: '重量差', count: 25 },
    { type: '单价', count: 20 },
    { type: '坏账', count: 15 },
    { type: '附加', count: 10 },
    { type: '索赔', count: 5 }
  ]
  const totalCount = typeData.reduce((sum, item) => sum + item.count, 0)
  typeTableData.value = typeData.map(item => ({
    ...item,
    percentage: `${((item.count / totalCount) * 100).toFixed(2)}%`
  }))
  
  // 问题件金额构成数据
  const compositionData = [
    { type: '个人分摊', amount: 30000, percentage: '30%' },
    { type: '公司分摊', amount: 50000, percentage: '50%' },
    { type: '代理赔付', amount: 20000, percentage: '20%' }
  ]
  compositionTableData.value = compositionData
}

// 渲染图表
const renderCharts = () => {
  // 渲染问题件数量图表
  if (countChartRef.value) {
    countChart = echarts.init(countChartRef.value)
    const countOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['待审批', '审批中', '审批驳回和取消', '待确认', '审批完成', '全部']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: countTableData.value.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '待审批',
          type: 'line',
          data: countTableData.value.map(item => item.pending)
        },
        {
          name: '审批中',
          type: 'line',
          data: countTableData.value.map(item => item.processing)
        },
        {
          name: '审批驳回和取消',
          type: 'line',
          data: countTableData.value.map(item => item.rejected)
        },
        {
          name: '待确认',
          type: 'line',
          data: countTableData.value.map(item => item.confirming)
        },
        {
          name: '审批完成',
          type: 'line',
          data: countTableData.value.map(item => item.completed)
        },
        {
          name: '全部',
          type: 'line',
          data: countTableData.value.map(item => item.total),
          lineStyle: {
            width: 3
          }
        }
      ]
    }
    countChart.setOption(countOption)
  }
  
  // 渲染问题件金额图表
  if (amountChartRef.value) {
    amountChart = echarts.init(amountChartRef.value)
    const amountOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['个人分摊', '公司分摊', '代理赔付', '赔付客户金额', '毛利润']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: amountTableData.value.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '个人分摊',
          type: 'line',
          data: amountTableData.value.map(item => item.personalShare)
        },
        {
          name: '公司分摊',
          type: 'line',
          data: amountTableData.value.map(item => item.companyShare)
        },
        {
          name: '代理赔付',
          type: 'line',
          data: amountTableData.value.map(item => item.proxyCompensation)
        },
        {
          name: '赔付客户金额',
          type: 'line',
          data: amountTableData.value.map(item => item.total),
          lineStyle: {
            width: 3
          }
        },
        {
          name: '毛利润',
          type: 'line',
          data: amountTableData.value.map(item => item.grossProfit)
        }
      ]
    }
    amountChart.setOption(amountOption)
  }
  
  // 渲染问题件类型图表
  if (typeChartRef.value) {
    typeChart = echarts.init(typeChartRef.value)
    const typeOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: typeTableData.value.map(item => item.type)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: typeTableData.value.map(item => item.count),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }
      ]
    }
    typeChart.setOption(typeOption)
  }
  
  // 渲染问题件金额构成图表
  if (compositionChartRef.value) {
    compositionChart = echarts.init(compositionChartRef.value)
    const compositionOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '金额构成',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: compositionTableData.value.map(item => ({
            name: item.type,
            value: item.amount
          }))
        }
      ]
    }
    compositionChart.setOption(compositionOption)
  }
}

// 导出PDF
const exportPDF = (type) => {
  // 模拟导出PDF功能
  console.log('导出PDF:', type)
  alert(`导出${type}报表PDF成功`)
}

// 导出Excel
const exportExcel = (type) => {
  // 模拟导出Excel功能
  let data, fileName
  
  switch (type) {
    case 'count':
      data = countTableData.value
      fileName = '问题件数量报表.xlsx'
      break
    case 'amount':
      data = amountTableData.value
      fileName = '问题件金额报表.xlsx'
      break
    case 'type':
      data = typeTableData.value
      fileName = '问题件类型报表.xlsx'
      break
    case 'composition':
      data = compositionTableData.value
      fileName = '问题件金额构成报表.xlsx'
      break
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, type === 'count' ? '问题件数量' : type === 'amount' ? '问题件金额' : type === 'type' ? '问题件类型' : '问题件金额构成')
  XLSX.writeFile(workbook, fileName)
}

// 响应式调整
const handleResize = () => {
  countChart?.resize()
  amountChart?.resize()
  typeChart?.resize()
  compositionChart?.resize()
}

// 初始化
onMounted(() => {
  // 设置默认时间范围为近7天
  setTimeRange('7days')
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件销毁时清理
const onUnmounted = () => {
  window.removeEventListener('resize', handleResize)
  countChart?.dispose()
  amountChart?.dispose()
  typeChart?.dispose()
  compositionChart?.dispose()
}
</script>

<style scoped>
.issue-statistics-container {
  padding: 0;
}

.search-card {
  margin-bottom: 24px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
}

.report-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.report-card {
  margin-bottom: 24px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.chart-container {
  margin: 20px;
}

.chart {
  height: 300px;
}

.chart-table {
  margin: 0 20px 20px;
}

/* 现代浅色主题样式 */
h2 {
  color: #303133;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
}

.el-card__header {
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  color: #303133;
  font-weight: 500;
  padding: 16px 20px;
}

.el-form-item__label {
  color: #606266;
  font-weight: 400;
}

.el-input {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #303133;
  border-radius: 4px;
  transition: all 0.3s;
}

.el-input__inner {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #303133;
  border-radius: 4px;
  transition: all 0.3s;
}

.el-input__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.el-select {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #303133;
  border-radius: 4px;
  transition: all 0.3s;
}

.el-select .el-input__inner {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #303133;
  border-radius: 4px;
  transition: all 0.3s;
}

.el-date-picker {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #303133;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-date-picker__header {
  background-color: #f5f7fa;
  color: #303133;
}

.el-date-table th {
  color: #606266;
}

.el-date-table td {
  color: #303133;
}

.el-button {
  border-radius: 4px;
  font-size: 14px;
  padding: 8px 16px;
  transition: all 0.3s;
}

.el-button--primary {
  background-color: #409eff;
  border: 1px solid #409eff;
  color: #ffffff;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border: 1px solid #66b1ff;
  color: #ffffff;
}

.el-button--default {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.el-button--default:hover {
  background-color: #ecf5ff;
  border: 1px solid #c6e2ff;
  color: #409eff;
}

.el-table {
  background-color: #ffffff;
  color: #303133;
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  padding: 12px 18px;
}

.el-table td {
  background-color: #ffffff;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding: 12px 18px;
}

.el-table__row:hover {
  background-color: #f5f7fa;
}

.el-pagination {
  color: #606266;
}

.el-pagination button {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 4px;
  transition: all 0.3s;
}

.el-pagination button:hover {
  background-color: #ecf5ff;
  border: 1px solid #c6e2ff;
  color: #409eff;
}

.el-pagination .btn-prev:hover:before,
.el-pagination .btn-next:hover:before {
  color: #409eff;
}

.el-pagination__active {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

.el-dialog {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.el-dialog__header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
}

.el-dialog__title {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .el-form-item {
    width: 100%;
  }
  
  .el-form-item__content {
    width: 100%;
  }
  
  .report-container {
    grid-template-columns: 1fr;
  }
}
</style>