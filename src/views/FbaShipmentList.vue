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

        <el-form-item label="亚马逊签收时间">
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
      <el-button :loading="syncingDeliveryStatus" @click="updateDeliveryStatus">更新派送状态</el-button>
    </div>

    <el-card class="table-card">
      <el-table :data="shipmentData" style="width: 100%" border row-key="id">
        <el-table-column prop="waybillNo" label="追踪编码" width="150" fixed="left" />
        <el-table-column prop="fbaNo" label="FBA号" width="180" />
        <el-table-column prop="boxNo" label="系统箱号" width="220" />
        <el-table-column prop="customerShortName" label="客户简称" width="130" />
        <el-table-column prop="recipient" label="收件人" width="130" />
        <el-table-column prop="destination" label="目的地" width="150" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column prop="state" label="州" width="100" />
        <el-table-column prop="zipCode" label="邮编" width="100" />
        <el-table-column prop="addressLine1" label="地址一" width="220" />

        <el-table-column label="承运商" width="150">
          <template #default="{ row }">
            {{ getCarrierLabel(row.carrier) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="trackingNo" label="快递单号" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="status-dot" :class="getStatus(row)" />
              <span :class="getStatus(row) === 'normal' ? 'text-normal' : 'text-abnormal'">
                {{ getStatus(row) === 'normal' ? '正常' : '异常' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="出仓时间" width="180" />
        <el-table-column prop="amazonSignTime" label="亚马逊签收时间" width="180" />
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
const syncingDeliveryStatus = ref(false)

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
      mockData.push({
        id: `SHIP${String(rowIndex).padStart(6, '0')}`,
        waybillNo,
        fbaNo,
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
  if (form.boxNo) filtered = filtered.filter(item => item.boxNo.includes(form.boxNo))
  if (form.customerShortName) filtered = filtered.filter(item => item.customerShortName === form.customerShortName)
  if (form.destination) filtered = filtered.filter(item => item.destination === form.destination)
  if (form.carrier) filtered = filtered.filter(item => item.carrier === form.carrier)
  if (form.status) filtered = filtered.filter(item => getStatus(item) === form.status)
  if (form.createTime?.length === 2) filtered = filterByDateRange(filtered, 'createTime', form.createTime)
  if (form.signTime?.length === 2) filtered = filterByDateRange(filtered, 'amazonSignTime', form.signTime)

  total.value = filtered.length
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
    亚马逊签收时间: item.amazonSignTime
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '货件明细')
  XLSX.writeFile(workbook, 'FBA货件明细.xlsx')
  ElMessage.success('导出成功')
}

const updateDeliveryStatus = async () => {
  if (syncingDeliveryStatus.value) return

  syncingDeliveryStatus.value = true
  try {
    await requestDeliveryStatusSync()
    ElMessage.success('✅ 触发成功，数据正在后台同步')
  } catch (error) {
    ElMessage.error(getSyncErrorMessage(error))
  } finally {
    syncingDeliveryStatus.value = false
  }
}

const requestDeliveryStatusSync = async () => {
  return Promise.resolve()
}

const getSyncErrorMessage = (error) => {
  const status = error?.response?.status
  const code = error?.code

  if (status === 429 || code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
    return '❌ 同步失败：请求过于频繁，请5分钟后再试'
  }

  return '❌ 同步失败：请求过于频繁，请5分钟后再试'
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
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 16px;
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
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
