<template>
  <div class="fba-shipment-list-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="追踪编码">
          <el-input v-model="searchForm.waybillNo" placeholder="请输入追踪编码" style="width: 180px" />
        </el-form-item>

        <el-form-item label="FBA号">
          <el-input v-model="searchForm.fbaNo" placeholder="请输入FBA号" style="width: 180px" />
        </el-form-item>

        <el-form-item label="运单号">
          <el-input v-model="searchForm.yunDanNo" placeholder="请输入运单号" style="width: 180px" />
        </el-form-item>

        <el-form-item label="系统箱号">
          <el-input v-model="searchForm.boxNo" placeholder="请输入系统箱号" style="width: 180px" />
        </el-form-item>

        <el-form-item label="客户简称">
          <el-select v-model="searchForm.customerShortName" placeholder="请选择客户简称" clearable style="width: 150px">
            <el-option v-for="customer in customerOptions" :key="customer.value" :label="customer.label" :value="customer.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="目的地">
          <el-select v-model="searchForm.destination" placeholder="请选择目的地" clearable style="width: 150px">
            <el-option v-for="country in destinationOptions" :key="country.value" :label="country.label" :value="country.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="承运商">
          <el-select v-model="searchForm.carrier" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="carrier in carrierOptions" :key="carrier.value" :label="carrier.label" :value="carrier.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="正常" value="normal" />
            <el-option label="异常" value="abnormal" />
          </el-select>
        </el-form-item>

        <el-form-item label="出仓时间">
          <el-date-picker v-model="searchForm.createTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
        </el-form-item>

        <el-form-item label="送仓时间">
          <el-date-picker v-model="searchForm.signTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <el-button type="primary" @click="exportExcel">导出Excel</el-button>
      <el-button type="default" circle @click="settingsVisible = true" class="settings-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </el-button>
    </div>

    <el-dialog v-model="settingsVisible" title="表格设置" width="520px" :close-on-click-modal="false">
      <div class="settings-section">
        <h3 class="settings-section-title">列显示</h3>
        <el-checkbox
          :model-value="visibleColumns.length === columnOptions.length"
          :indeterminate="visibleColumns.length > 0 && visibleColumns.length < columnOptions.length"
          @change="handleCheckAll"
        >全选</el-checkbox>
        <el-checkbox-group v-model="visibleColumns" class="column-checkbox-group">
          <el-checkbox v-for="col in columnOptions" :key="col.prop" :label="col.prop" :disabled="col.fixed">
            {{ col.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="settings-section">
        <h3 class="settings-section-title">排序方式</h3>
        <div class="sort-row">
          <el-select v-model="sortColumn" placeholder="选择排序列" clearable style="width: 200px">
            <el-option v-for="col in sortableColumns" :key="col.prop" :label="col.label" :value="col.prop" />
          </el-select>
          <el-radio-group v-model="sortOrder" :disabled="!sortColumn" style="margin-left: 16px">
            <el-radio value="asc">升序</el-radio>
            <el-radio value="desc">降序</el-radio>
          </el-radio-group>
        </div>
        <el-button v-if="sortColumn" link type="danger" @click="clearSort" style="margin-top: 8px">清除排序</el-button>
      </div>
      <template #footer>
        <el-button @click="settingsVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">确定</el-button>
      </template>
    </el-dialog>

    <el-card class="table-card">
      <el-table :data="shipmentData" style="width: 100%" border row-key="id" @sort-change="handleSortChange">
        <el-table-column v-if="isColumnVisible('waybillNo')" prop="waybillNo" label="追踪编码" width="150" fixed="left" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('fbaNo')" prop="fbaNo" label="FBA号" width="180" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('yunDanNo')" prop="yunDanNo" label="运单号" width="180" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('boxNo')" prop="boxNo" label="系统箱号" width="220" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('customerShortName')" prop="customerShortName" label="客户简称" width="130" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('recipient')" prop="recipient" label="收件人" width="130" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('destination')" prop="destination" label="目的地" width="150" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('city')" prop="city" label="城市" width="120" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('state')" prop="state" label="州" width="100" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('zipCode')" prop="zipCode" label="邮编" width="100" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('addressLine1')" prop="addressLine1" label="地址一" width="220" sortable="custom" :sort-orders="['ascending', 'descending']" />

        <el-table-column v-if="isColumnVisible('carrier')" label="承运商" width="150" sortable="custom" :sort-orders="['ascending', 'descending']" prop="carrier">
          <template #default="{ row }">
            {{ getCarrierLabel(row.carrier) || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="isColumnVisible('trackingNo')" prop="trackingNo" label="快递单号" width="180" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('status')" label="状态" width="100" prop="trackingNo">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="status-dot" :class="getStatus(row)" />
              <span :class="getStatus(row) === 'normal' ? 'text-normal' : 'text-abnormal'">
                {{ getStatus(row) === 'normal' ? '正常' : '异常' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="isColumnVisible('createTime')" prop="createTime" label="出仓时间" width="180" sortable="custom" :sort-orders="['ascending', 'descending']" />
        <el-table-column v-if="isColumnVisible('amazonSignTime')" prop="amazonSignTime" label="送仓时间" width="180" sortable="custom" :sort-orders="['ascending', 'descending']" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

const searchForm = ref({
  waybillNo: '',
  fbaNo: '',
  yunDanNo: '',
  boxNo: '',
  customerShortName: '',
  destination: '',
  carrier: '',
  status: '',
  createTime: [],
  signTime: []
})

const carrierOptions = ref([
  { label: '承运商A', value: 'carrierA' },
  { label: '承运商B', value: 'carrierB' },
  { label: '承运商C', value: 'carrierC' },
  { label: '承运商D', value: 'carrierD' }
])

const customerOptions = ref([
  { label: '天途华东', value: '天途华东' },
  { label: '天途华南', value: '天途华南' },
  { label: '天途北美', value: '天途北美' },
  { label: '星宇电商', value: '星宇电商' },
  { label: '云仓客户', value: '云仓客户' }
])

const destinationOptions = ref([
  { label: '美国', value: '美国' },
  { label: '加拿大', value: '加拿大' },
  { label: '英国', value: '英国' },
  { label: '德国', value: '德国' },
  { label: '法国', value: '法国' },
  { label: '意大利', value: '意大利' },
  { label: '西班牙', value: '西班牙' },
  { label: '荷兰', value: '荷兰' }
])

const allShipmentData = ref([])
const shipmentData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const settingsVisible = ref(false)
const columnOptions = ref([
  { prop: 'waybillNo', label: '追踪编码', fixed: true },
  { prop: 'fbaNo', label: 'FBA号' },
  { prop: 'yunDanNo', label: '运单号' },
  { prop: 'boxNo', label: '系统箱号' },
  { prop: 'customerShortName', label: '客户简称' },
  { prop: 'recipient', label: '收件人' },
  { prop: 'destination', label: '目的地' },
  { prop: 'city', label: '城市' },
  { prop: 'state', label: '州' },
  { prop: 'zipCode', label: '邮编' },
  { prop: 'addressLine1', label: '地址一' },
  { prop: 'carrier', label: '承运商' },
  { prop: 'trackingNo', label: '快递单号' },
  { prop: 'status', label: '状态' },
  { prop: 'createTime', label: '出仓时间' },
  { prop: 'amazonSignTime', label: '送仓时间' }
])
const sortableColumns = ref(columnOptions.value.filter(c => !['status', 'carrier'].includes(c.prop)))
const visibleColumns = ref(columnOptions.value.map(c => c.prop))
const sortColumn = ref('')
const sortOrder = ref('asc')

const isColumnVisible = (prop) => visibleColumns.value.includes(prop)

const handleCheckAll = (checked) => {
  visibleColumns.value = checked
    ? columnOptions.value.map(c => c.prop)
    : columnOptions.value.filter(c => c.fixed).map(c => c.prop)
}

const clearSort = () => {
  sortColumn.value = ''
  sortOrder.value = 'asc'
}

const saveSettings = () => {
  settingsVisible.value = false
  currentPage.value = 1
  refreshTable()
}

const getCarrierLabel = (carrierValue) => {
  return carrierOptions.value.find(carrier => carrier.value === carrierValue)?.label || carrierValue
}

const getStatus = (row) => {
  return row.trackingNo ? 'normal' : 'abnormal'
}

const initMockData = () => {
  const mockData = []
  const carriers = carrierOptions.value.map(carrier => carrier.value)
  const customerShortNames = customerOptions.value.map(customer => customer.value)
  const recipients = ['Amazon LAX', 'Amazon JFK', 'Amazon ORD', 'Amazon IAH', 'Amazon PHX']
  const destinations = destinationOptions.value.map(country => country.value)
  const cities = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix']
  const states = ['CA', 'NY', 'IL', 'TX', 'AZ']
  const addressLine1List = [
    '123 Amazon Way',
    '88 Madison Ave',
    '3500 S Pulaski Rd',
    '9100 Bay Area Blvd',
    '4100 W Van Buren St'
  ]
  let rowIndex = 1

  for (let i = 1; i <= 30; i++) {
    const waybillNo = `YW${2026040000 + i}`
    const fbaNo = `FBA2026${String(i).padStart(6, '0')}`
    const customerShortName = customerShortNames[i % customerShortNames.length]
    const recipient = recipients[i % recipients.length]
    const destination = destinations[i % destinations.length]
    const city = cities[i % cities.length]
    const state = states[i % states.length]
    const addressLine1 = addressLine1List[i % addressLine1List.length]
    const zipCode = `${90000 + i * 17}`
    const carrier = carriers[i % carriers.length]
    const trackingNo = i % 5 !== 0 ? `TRK${2026000000 + i}` : ''
    const createTime = new Date(2026, 3, 1 + (i % 20), 9, 30).toLocaleString('zh-CN')
    const amazonSignTime = new Date(2026, 3, 5 + (i % 20), 15, 20).toLocaleString('zh-CN')
    const boxCount = (i % 4) + 1

    for (let j = 1; j <= boxCount; j++) {
      const yunDanNo = `YD${2026040000 + i}`

      mockData.push({
        id: `SHIP${String(rowIndex).padStart(6, '0')}`,
        waybillNo,
        fbaNo,
        yunDanNo,
        boxNo: `${waybillNo}U${String(j).padStart(4, '0')}`,
        customerShortName,
        recipient,
        destination,
        city,
        state,
        zipCode,
        addressLine1,
        carrier,
        trackingNo,
        createTime,
        amazonSignTime
      })
      rowIndex += 1
    }
  }

  allShipmentData.value = mockData
  refreshTable()
}

const refreshTable = () => {
  let filtered = [...allShipmentData.value]
  const form = searchForm.value

  if (form.waybillNo) filtered = filtered.filter(item => item.waybillNo.includes(form.waybillNo))
  if (form.fbaNo) filtered = filtered.filter(item => item.fbaNo.includes(form.fbaNo))
  if (form.yunDanNo) filtered = filtered.filter(item => item.yunDanNo.includes(form.yunDanNo))
  if (form.boxNo) filtered = filtered.filter(item => item.boxNo.includes(form.boxNo))
  if (form.customerShortName) filtered = filtered.filter(item => item.customerShortName === form.customerShortName)
  if (form.destination) filtered = filtered.filter(item => item.destination === form.destination)
  if (form.carrier) filtered = filtered.filter(item => item.carrier === form.carrier)
  if (form.status) filtered = filtered.filter(item => getStatus(item) === form.status)
  if (form.createTime?.length === 2) filtered = filterByDateRange(filtered, 'createTime', form.createTime)
  if (form.signTime?.length === 2) filtered = filterByDateRange(filtered, 'amazonSignTime', form.signTime)

  total.value = filtered.length

  if (sortColumn.value) {
    filtered.sort((a, b) => {
      let valA = a[sortColumn.value]
      let valB = b[sortColumn.value]
      if (sortColumn.value === 'carrier') {
        valA = getCarrierLabel(valA)
        valB = getCarrierLabel(valB)
      }
      if (sortColumn.value === 'status') {
        valA = getStatus(a) === 'normal' ? '正常' : '异常'
        valB = getStatus(b) === 'normal' ? '正常' : '异常'
      }
      const cmp = valA > valB ? 1 : valA < valB ? -1 : 0
      return sortOrder.value === 'desc' ? -cmp : cmp
    })
  }

  const start = (currentPage.value - 1) * pageSize.value
  shipmentData.value = filtered.slice(start, start + pageSize.value)
}

const filterByDateRange = (rows, field, range) => {
  const [start, end] = range
  const startTime = new Date(start).setHours(0, 0, 0, 0)
  const endTime = new Date(end).setHours(23, 59, 59, 999)
  return rows.filter(row => {
    const current = new Date(row[field]).getTime()
    return current >= startTime && current <= endTime
  })
}

const search = () => {
  currentPage.value = 1
  refreshTable()
}

const resetForm = () => {
  searchForm.value = {
    waybillNo: '',
    fbaNo: '',
    yunDanNo: '',
    boxNo: '',
    customerShortName: '',
    destination: '',
    carrier: '',
    status: '',
    createTime: [],
    signTime: []
  }
  currentPage.value = 1
  refreshTable()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  refreshTable()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  refreshTable()
}

const exportExcel = () => {
  const exportData = allShipmentData.value.map(item => ({
    追踪编码: item.waybillNo,
    FBA号: item.fbaNo,
    运单号: item.yunDanNo,
    系统箱号: item.boxNo,
    客户简称: item.customerShortName,
    收件人: item.recipient,
    目的地: item.destination,
    城市: item.city,
    州: item.state,
    邮编: item.zipCode,
    地址一: item.addressLine1,
    承运商: getCarrierLabel(item.carrier),
    快递单号: item.trackingNo,
    状态: getStatus(item) === 'normal' ? '正常' : '异常',
    出仓时间: item.createTime,
    送仓时间: item.amazonSignTime
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '货件明细')
  XLSX.writeFile(workbook, 'FBA货件明细.xlsx')
  ElMessage.success('导出成功')
}

const handleSortChange = ({ prop, order }) => {
  if (!prop || !order) {
    sortColumn.value = ''
    sortOrder.value = 'asc'
  } else {
    sortColumn.value = prop
    sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  }
  currentPage.value = 1
  refreshTable()
}

onMounted(() => {
  initMockData()
})
</script>

<style scoped>
.fba-shipment-list-container {
  padding: 0;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 16px;
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.settings-btn {
  flex-shrink: 0;
  color: #606266;
}

.settings-btn:hover {
  color: #409eff;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.column-checkbox-group {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 4px;
}

.sort-row {
  display: flex;
  align-items: center;
}

.search-card {
  margin-bottom: 18px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  padding: 18px 18px 0;
}

.table-card {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 20px;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.normal {
  background-color: #67c23a;
}

.status-dot.abnormal {
  background-color: #f56c6c;
}

.text-normal {
  color: #67c23a;
}

.text-abnormal {
  color: #f56c6c;
}
</style>
