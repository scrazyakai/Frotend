import request, { ApiResponse } from '@/utils/request'
import { PageData } from './activity'

// 评论数据类型
export interface Comment {
  id: number
  userId: number
  userName: string
  userAvatarURL?: string
  activityId: number
  parentId: number | null
  replyCommentId: number | null
  imageURL?: string
  isTop: number
  level: number
  replyTotal: number
  likeTotal: number
  content: string
  isLiked: boolean
  createTime: string
  updateTime: string
}

// 添加评论请求参数
export interface AddCommentForm {
  activityId: number
  parentId?: number | null
  content: string
  imageURL?: string
}

// 更新评论请求参数
export interface UpdateCommentForm {
  commentId: number
  content: string
  imageURL?: string
}

/**
 * 添加评论
 * @param data 评论数据
 */
export function addComment(data: AddCommentForm): Promise<ApiResponse<number>> {
  return request({
    url: '/activity/comment/add',
    method: 'post',
    data
  })
}

/**
 * 删除评论
 * @param commentId 评论ID
 */
export function deleteComment(commentId: number): Promise<ApiResponse<boolean>> {
  return request({
    url: '/activity/comment/delete',
    method: 'post',
    data: { commentId }
  })
}

/**
 * 更新评论
 * @param data 评论数据
 */
export function updateComment(data: UpdateCommentForm): Promise<ApiResponse<boolean>> {
  return request({
    url: '/activity/comment/update',
    method: 'post',
    data
  })
}

/**
 * 查询活动的评论列表（一级评论）
 * @param activityId 活动ID
 * @param pageNo 页码
 * @param pageSize 页大小
 */
export function getCommentList(
  activityId: number,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PageData<Comment>>> {
  return request({
    url: '/activity/comment/list',
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
 * @param parentId 父评论ID
 * @param pageNo 页码
 * @param pageSize 页大小
 */
export function getReplyList(
  parentId: number,
  pageNo: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PageData<Comment>>> {
  return request({
    url: '/activity/comment/reply/list',
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
 * @param commentId 评论ID
 * @returns 点赞总数
 */
export function toggleLikeComment(commentId: number): Promise<ApiResponse<number>> {
  return request({
    url: '/activity/comment/toggleLike',
    method: 'post',
    data: { commentId }
  })
}
