import request, { ApiResponse } from '@/utils/request'

// 活动状态枚举
export enum ActivityStatus {
  NOT_STARTED = 1, // 未开始
  IN_PROGRESS = 2, // 正在进行中
  ENDED = 3, // 已结束
  CANCELLED = 4 // 已取消
}

// 活动数据类型
export interface Activity {
  activityId: number
  activityDesc: string
  startTime: string
  endTime: string
  status: ActivityStatus
  coverURL?: string
  maxMemberNumber: number
  createTime: string
  ownerId: number
  userAvatarURL?: string
  userName: string
  currentMemberNumber: number
}

// 添加/更新活动请求参数
export interface ActivityForm {
  activityId?: number
  activityDesc?: string
  startTime?: string
  endTime?: string
  status?: ActivityStatus
  coverURL?: string
  maxMemberNumber?: number
}

// 分页响应类型
export interface PageData<T> {
  records: T[]
  total: number
  size: number
  current: number
}

/**
 * 添加活动
 * @param data 活动数据
 */
export function addActivity(data: ActivityForm): Promise<ApiResponse<boolean>> {
  return request({
    url: '/activity/add',
    method: 'post',
    data
  })
}

/**
 * 更新活动
 * @param data 活动数据（包含 activityId）
 */
export function updateActivity(data: ActivityForm): Promise<ApiResponse<boolean>> {
  return request({
    url: '/activity/update',
    method: 'post',
    data
  })
}

/**
 * 取消活动
 * @param activityId 活动ID
 */
export function cancelActivity(activityId: number): Promise<ApiResponse<boolean>> {
  return request({
    url: '/activity/cancel',
    method: 'post',
    params: { activityId }
  })
}

/**
 * 加入活动
 * @param activityId 活动ID
 */
export function joinActivity(activityId: number): Promise<ApiResponse<boolean>> {
  return request({
    url: '/activity/join',
    method: 'post',
    data: { activityId }
  })
}

/**
 * 退出活动
 * @param activityId 活动ID
 */
export function quitActivity(activityId: number): Promise<ApiResponse<boolean>> {
  return request({
    url: '/activity/quit',
    method: 'post',
    data: { activityId }
  })
}

/**
 * 查询活动列表
 * @param pageNo 页码
 */
export function getActivityList(pageNo: number = 1): Promise<ApiResponse<PageData<Activity>>> {
  return request({
    url: '/activity/list',
    method: 'post',
    params: { pageNo }
  })
}

/**
 * 查询活动详情
 * @param activityId 活动ID
 * 注意：接口文档中没有单独的详情接口，这里使用 list 接口获取后筛选
 * 实际项目中建议后端提供单独的详情接口
 */
export async function getActivityDetail(activityId: number): Promise<ApiResponse<Activity>> {
  // 由于接口文档没有提供单独的详情接口，这里从列表中查找
  // 实际使用时需要后端提供单独的详情接口
  const res = await getActivityList(1)
  const activity = res.data.records.find((item) => item.activityId === activityId)
  
  if (!activity) {
    throw new Error('活动不存在')
  }
  
  return {
    code: 0,
    data: activity,
    message: 'ok',
    description: ''
  }
}
