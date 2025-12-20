import request from '@/utils/request'
export function activity(pageNo = 1) {
    return request({
        url: '/api/activity/list',
        method: 'post',
        params: { pageNo }
    })
}