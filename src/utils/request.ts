import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// 响应数据类型定义
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  description: string
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000
})

// 请求拦截器：自动携带 SaToken
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['satoken'] = token
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理响应
request.interceptors.response.use(
  (response: any) => {
    const { code, message } = response.data
    
    // 成功响应
    if (code === 0) {
      return response.data
    }
    
    // 业务错误
    ElMessage.error(message || '请求失败')
    return Promise.reject(response.data)
  },
  (error: any) => {
    // HTTP 错误
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          ElMessage.error('未登录，请先登录')
          localStorage.removeItem('token')
          // 跳转到登录页
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      // 请求配置错误
      ElMessage.error(error.message || '请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default request
