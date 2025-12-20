import request from '@/utils/request'
export function activity(data){
    return request({
        url: '/api/user/activity/list',
        data
    })
}