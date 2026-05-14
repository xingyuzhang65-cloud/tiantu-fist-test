<template>
  <div class="tracking-dashboard">
    <el-card class="filter-card">
      <div class="time-toolbar">
        <button
          v-for="option in rangeTypeOptions"
          :key="option.value"
          class="range-button"
          :class="{ active: activeRangeType === option.value }"
          type="button"
          @click="setQuickRange(option.value)"
        >
          {{ option.label }}
        </button>
        <el-date-picker
          v-model="filterForm.inboundTime"
          class="time-range-picker"
          type="daterange"
          range-separator="→"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="false"
          @change="activeRangeType = ''"
        />
        <el-button type="primary" class="query-button" @click="handleSearch">查询</el-button>
      </div>
    </el-card>

    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">快递单号准确率</span>
        <strong>{{ summary.accuracy }}%</strong>
      </div>
      <div class="summary-item">
        <span class="summary-label">总量</span>
        <strong>{{ summary.total }}</strong>
      </div>
      <div class="summary-item">
        <span class="summary-label">正常</span>
        <strong>{{ summary.normal }}</strong>
      </div>
      <div class="summary-item warning">
        <span class="summary-label">异常</span>
        <strong>{{ summary.abnormal }}</strong>
      </div>
    </div>

    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <div>
            <h2>快递单号准确率</h2>
            <p>按入仓时间统计送往亚马逊货箱的快递单号填写准确率</p>
          </div>
        </div>
      </template>

      <div ref="chartRef" class="accuracy-chart"></div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
const filterForm = ref({
  inboundTime: []
})
const activeRangeType = ref('day')

const rangeTypeOptions = [
  { label: '日(10天)', value: 'day' },
  { label: '周(10周)', value: 'week' },
  { label: '月(12个月)', value: 'month' }
]

let chartInstance = null

const sourceData = ref([
  { date: '2026-04-19', total: 128, normal: 121 },
  { date: '2026-04-20', total: 146, normal: 135 },
  { date: '2026-04-21', total: 138, normal: 131 },
  { date: '2026-04-22', total: 152, normal: 140 },
  { date: '2026-04-23', total: 165, normal: 158 },
  { date: '2026-04-24', total: 171, normal: 162 },
  { date: '2026-04-25', total: 149, normal: 139 },
  { date: '2026-04-26', total: 158, normal: 151 },
  { date: '2026-04-27', total: 176, normal: 167 },
  { date: '2026-04-28', total: 184, normal: 178 },
  { date: '2026-04-29', total: 173, normal: 164 },
  { date: '2026-04-30', total: 190, normal: 181 },
  { date: '2026-05-01', total: 156, normal: 148 },
  { date: '2026-05-02', total: 142, normal: 132 },
  { date: '2026-05-03', total: 168, normal: 160 },
  { date: '2026-05-04', total: 186, normal: 177 },
  { date: '2026-05-05', total: 194, normal: 187 },
  { date: '2026-05-06', total: 201, normal: 193 },
  { date: '2026-05-07', total: 188, normal: 180 }
])

const dashboardRows = computed(() => {
  const [start, end] = filterForm.value.inboundTime || []
  if (!start || !end) {
    return sourceData.value.map(normalizeRow)
  }

  const startTime = new Date(start).setHours(0, 0, 0, 0)
  const endTime = new Date(end).setHours(23, 59, 59, 999)

  return sourceData.value
    .filter((item) => {
      const current = new Date(item.date).getTime()
      return current >= startTime && current <= endTime
    })
    .map(normalizeRow)
})

const summary = computed(() => {
  const total = dashboardRows.value.reduce((sum, item) => sum + item.total, 0)
  const normal = dashboardRows.value.reduce((sum, item) => sum + item.normal, 0)
  const abnormal = total - normal
  const accuracy = total ? ((normal / total) * 100).toFixed(2) : '0.00'

  return {
    total,
    normal,
    abnormal,
    accuracy
  }
})

const normalizeRow = (row) => {
  const abnormal = row.total - row.normal
  const accuracy = row.total ? Number(((row.normal / row.total) * 100).toFixed(2)) : 0

  return {
    ...row,
    abnormal,
    accuracy
  }
}

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const addMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const setQuickRange = (type) => {
  activeRangeType.value = type

  const end = new Date('2026-05-07')
  const rangeStartMap = {
    day: addDays(end, -9),
    week: addDays(end, -69),
    month: addMonths(end, -11)
  }

  filterForm.value.inboundTime = [
    formatDate(rangeStartMap[type]),
    formatDate(end)
  ]
  nextTick(renderChart)
}

const renderChart = () => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const rows = dashboardRows.value

  chartInstance.setOption({
    color: ['#165dff', '#13c7a2', '#f56c6c', '#ff7d00'],
    grid: {
      top: 42,
      left: 48,
      right: 68,
      bottom: 42
    },
    legend: {
      data: ['总量', '正常', '异常', '准确率'],
      top: 8,
      textStyle: { color: '#4e5969' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#999' }
      },
      formatter(params) {
        const row = params[0].data.raw
        return [
          `<span style="color:#86909c;font-size:12px">${row.date.slice(5)}</span>`,
          `<span style="color:#1d2129">总量：${row.total}</span>`,
          `<span style="color:#13c7a2">正常：${row.normal}</span>`,
          `<span style="color:#f56c6c">异常：${row.abnormal}</span>`,
          `<span style="color:#ff7d00;font-weight:600">准确率：${row.accuracy}%</span>`
        ].join('<br/>')
      }
    },
    xAxis: {
      type: 'category',
      name: '入仓时间',
      boundaryGap: true,
      data: rows.map((item) => item.date.slice(5)),
      axisLine: {
        lineStyle: { color: '#c9cdd4' }
      },
      axisLabel: {
        color: '#4e5969'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        axisLabel: {
          color: '#4e5969'
        },
        splitLine: {
          lineStyle: { color: '#eef0f4' }
        }
      },
      {
        type: 'value',
        name: '百分比',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: '#4e5969'
        },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '总量',
        type: 'bar',
        barMaxWidth: 32,
        data: rows.map((item) => ({
          value: item.total,
          raw: item
        }))
      },
      {
        name: '正常',
        type: 'bar',
        barMaxWidth: 32,
        data: rows.map((item) => ({
          value: item.normal,
          raw: item
        }))
      },
      {
        name: '异常',
        type: 'bar',
        barMaxWidth: 32,
        data: rows.map((item) => ({
          value: item.abnormal,
          raw: item
        }))
      },
      {
        name: '准确率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 3 },
        data: rows.map((item) => ({
          value: item.accuracy,
          raw: item
        }))
      }
    ]
  })
}

const handleSearch = () => {
  nextTick(renderChart)
}

const handleReset = () => {
  setQuickRange('day')
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  setQuickRange('day')
  nextTick(renderChart)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.tracking-dashboard {
  padding: 0;
}

.filter-card {
  margin-bottom: 18px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-card :deep(.el-card__body) {
  padding: 12px 14px;
}

.time-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.range-button {
  width: 78px;
  height: 32px;
  padding: 0;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 0;
  color: #1f2d3d;
  cursor: pointer;
  font-size: 14px;
  line-height: 30px;
}

.range-button + .range-button {
  margin-left: -8px;
}

.range-button:hover {
  color: #409eff;
}

.range-button.active {
  position: relative;
  z-index: 1;
  border-color: #409eff;
  color: #409eff;
  font-weight: 500;
}

.time-range-picker {
  width: 150px;
}

.time-range-picker :deep(.el-range-input) {
  font-size: 12px;
}

.time-range-picker :deep(.el-range-separator) {
  color: #a8abb2;
  flex: 0 0 16px;
  font-size: 12px;
}

.time-range-picker :deep(.el-input__wrapper) {
  padding: 0 6px;
}

.time-range-picker :deep(.el-input__wrapper) {
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.query-button {
  width: 64px;
  height: 32px;
  border-radius: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-item {
  min-height: 86px;
  padding: 16px 18px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.summary-label {
  display: block;
  margin-bottom: 10px;
  color: #4e5969;
  font-size: 13px;
}

.summary-item strong {
  color: #1d2129;
  font-size: 28px;
  line-height: 1;
}

.summary-item.warning strong {
  color: #f56c6c;
}

.chart-card {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.card-header h2 {
  margin: 0 0 6px;
  color: #1d2129;
  font-size: 18px;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #86909c;
  font-size: 13px;
}

.accuracy-chart {
  width: 100%;
  height: 430px;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
}

@media (max-width: 720px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .accuracy-chart {
    height: 360px;
  }
}
</style>
