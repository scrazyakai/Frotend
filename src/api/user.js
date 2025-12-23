import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/api/user/login',
        method: 'post',
        data
    })
}
export function register(data){
    return request({
        url: '/api/user/register',
        method: 'post',
        data
    })
}
export function current(){
    return request({
      url: '/api/user/current',
      method: 'get'
    })
}
export function recommend(){
    return request({
      url: '/api/user/recommend',
      method: 'get'
    })
}
export function logout(){
    return request({
      url: '/api/user/logout',
      method: 'post'
    })
}
