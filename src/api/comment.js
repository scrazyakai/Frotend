import request from '@/utils/request'

/**
 * 添加评论
 * @param {Object} data 评论数据
 * @param {number} data.activityId 活动ID
 * @param {number} [data.parentId] 父评论ID（一级评论为null，二级评论传入父评论ID）
 * @param {string} data.content 评论内容
 * @param {string} [data.imageURL] 评论图片URL（可选）
 * @returns {Promise} Promise对象
 */
export function addComment(data) {
  return request({
    url: '/api/activity/comment/add',
    method: 'post',
    data
  })
}

/**
 * 删除评论
 * @param {number} commentId 评论ID
 * @returns {Promise} Promise对象
 */
export function deleteComment(commentId) {
  return request({
    url: '/api/activity/comment/delete',
    method: 'post',
    data: { commentId }
  })
}

/**
 * 更新评论
 * @param {Object} data 评论数据
 * @param {number} data.commentId 评论ID
 * @param {string} data.content 评论内容
 * @param {string} [data.imageURL] 评论图片URL（可选）
 * @returns {Promise} Promise对象
 */
export function updateComment(data) {
  return request({
    url: '/api/activity/comment/update',
    method: 'post',
    data
  })
}

/**
 * 查询活动的评论列表（一级评论）
 * @param {number} activityId 活动ID
 * @param {number} [pageNo=1] 页码，默认为1
 * @param {number} [pageSize=10] 页大小，默认为10
 * @returns {Promise} Promise对象
 */
export function getCommentList(activityId, pageNo = 1, pageSize = 10) {
  return request({
    url: '/api/activity/comment/list',
    method: 'post',
    data: {
      activityId,
      pageNo,
      pageSize
    }
  })
}

/**
 * 查询评论的回复列表（二级评论）
 * @param {number} parentId 父评论ID
 * @param {number} [pageNo=1] 页码，默认为1
 * @param {number} [pageSize=10] 页大小，默认为10
 * @returns {Promise} Promise对象
 */
export function getReplyList(parentId, pageNo = 1, pageSize = 10) {
  return request({
    url: '/api/activity/comment/reply/list',
    method: 'post',
    data: {
      parentId,
      pageNo,
      pageSize
    }
  })
}

/**
 * 点赞/取消点赞评论
 * @param {number} commentId 评论ID
 * @returns {Promise} Promise对象，返回点赞总数
 */
export function toggleLikeComment(commentId) {
  return request({
    url: '/api/activity/comment/toggleLike',
    method: 'post',
    data: { commentId }
  })
}
