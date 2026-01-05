import request from '@/utils/request'
export function activity(pageNo = 1) {
    return request({
        url: '/api/activity/list',
        method: 'post',
        params: { pageNo }
    })
}

export function add(activity) {
    return request({
        url: '/api/activity/add',
        method: 'post',
        data: activity
    })
}

export function update(activity) {
    return request({
        url: '/api/activity/update',
        method: 'post',
        data: activity
    })
}

export function cancel(activityId) {
    return request({
        url: '/api/activity/cancel',
        method: 'post',
        params: { activityId }
    })
}
