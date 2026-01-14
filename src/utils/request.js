import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000
})

// 请求拦截器：自动带 token
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['satoken'] = token
    }
    return config
})

// 响应拦截器：处理 token 过期
request.interceptors.response.use(
    // 响应成功
    response => {
        const { code, message } = response.data
        
        // 检查是否是 token 过期的错误码
        if (code === 50000) {
            // 清除过期的 token 和用户信息
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            
            // 提示用户
            ElMessage.error('登录已过期，请重新登录')
            
            // 跳转到登录页（排除登录页本身的请求，避免无限循环）
            if (router.currentRoute.value.path !== '/login') {
                router.push('/login')
            }
            
            // 返回一个被拒绝的 Promise，阻止后续处理
            return Promise.reject(new Error('Token expired'))
        }
        
        return response
    },
    // 响应错误（网络错误、超时等）
    error => {
        // 其他错误也返回，让调用方处理
        return Promise.reject(error)
    }
)

export default request
