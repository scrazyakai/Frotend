import { createRouter, createWebHistory } from 'vue-router'
import LoginView from "@/views/LoginView.vue"
import TestView from "@/views/TestView.vue"
import HomeView from "@/views/HomeView.vue"

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/test',
    name: 'test',
    component: TestView,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 没有 token
  if (!token) {
    // 不是去 login，就强制跳 login
    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
  } else {
    // 有 token
    // 如果还想去 login，直接跳首页
    if (to.path === '/login') {
      next('/')
    } else {
      next()
    }
  }
})


export default router
