import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/fba/shipment-list'
  },
  {
    path: '/fba',
    redirect: '/fba/shipment-list'
  },
  {
    path: '/fba/shipment-list',
    name: 'FbaShipmentList',
    component: () => import('../views/FbaShipmentList.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router