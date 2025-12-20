import axios from 'axios'

const request = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000
})

// 请求拦截器：自动带 token
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = token
    }
    return config
})

export default request
