import { createRouter,createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'

// 仅做示例，根据业务修改路径等

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../views/index/index.vue'),
    name: 'index',
    meta: {
      title: '首页'
    }
  }
]
//打包页面空白使用 createWebHistory createWebHashHistory
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 前置路由
router.beforeEach((to, from, next) => {
  next();
})

export default router
