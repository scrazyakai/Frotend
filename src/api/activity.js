import request from '@/utils/request'

/**
 * 查询活动列表
 * @param {number} pageNo 页码，默认为1
 * @returns {Promise} Promise对象
 */
export function activity(pageNo = 1) {
    return request({
        url: '/api/activity/list',
        method: 'post',
        data: { pageNo }
    })
}

/**
 * 添加活动
 * @param {Object} data 活动数据
 * @returns {Promise} Promise对象
 */
export function add(data) {
    return request({
        url: '/api/activity/add',
        method: 'post',
        data
    })
}

/**
 * 更新活动
 * @param {Object} data 活动数据
 * @returns {Promise} Promise对象
 */
export function update(data) {
    return request({
        url: '/api/activity/update',
        method: 'post',
        data
    })
}

/**
 * 取消活动
 * @param {number} activityId 活动ID
 * @returns {Promise} Promise对象
 */
export function cancel(activityId) {
    return request({
        url: '/api/activity/cancel',
        method: 'post',
        data: { activityId }
    })
}

/**
 * 加入活动
 * @param {number} activityId 活动ID
 * @returns {Promise} Promise对象
 */
export function join(activityId) {
    return request({
        url: '/api/activity/join',
        method: 'post',
        data: { activityId }
    })
}

/**
 * 退出活动
 * @param {number} activityId 活动ID
 * @returns {Promise} Promise对象
 */
export function quit(activityId) {
    return request({
        url: '/api/activity/quit',
        method: 'post',
        data: { activityId }
    })
}

/**
 * 获取活动详情
 * @param {number} activityId 活动ID
 * @returns {Promise} Promise对象
 */
export function detail(activityId) {
    return request({
        url: '/api/activity/detail',
        method: 'post',
        data: { activityId }
    })
}
