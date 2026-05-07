<template>
  <div class="app-container">
    <el-container>
      <el-aside width="220px" class="sidebar">
        <div class="logo-area">
          <span class="logo-text">FBA 管理平台</span>
        </div>
        <el-menu :default-active="activeMenu" class="sidebar-menu" router>
          <el-menu-item index="/fba/shipment-list">
            <el-icon><List /></el-icon>
            <span>快递单号准确率明细</span>
          </el-menu-item>
          <el-menu-item index="/fba/tracking-accuracy">
            <el-icon><TrendCharts /></el-icon>
            <span>快递单号准确率看板</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { List, TrendCharts } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f0f2f5;
}

.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e8e8e8;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.logo-area {
  height: 56px;
  display: flex;
  align-items: center;
  padding-left: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  letter-spacing: 1px;
}

.sidebar-menu {
  height: calc(100% - 56px);
  border-right: none;
}

.sidebar-menu .el-menu-item {
  margin: 4px 12px;
  border-radius: 6px;
  height: 44px;
  line-height: 44px;
  color: #4e5969;
  font-size: 14px;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f2f3f5;
  color: #1d2129;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #e8f3ff;
  color: #165dff;
  font-weight: 500;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.el-main {
  padding: 20px 24px;
  overflow-y: auto;
  background-color: #f0f2f5;
  color: #1d2129;
}
</style>
