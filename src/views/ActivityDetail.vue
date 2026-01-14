<template>
  <div class="activity-detail-container">
    <el-button @click="goBack" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <div v-loading="loading" class="detail-content">
      <el-empty v-if="!loading && !activity" description="活动不存在" />

      <div v-if="activity" class="activity-detail">
        <!-- 活动头部信息 -->
        <el-card class="activity-header">
          <div class="header-content">
            <!-- 封面图 -->
            <div class="activity-cover" v-if="activity.coverURL">
              <img :src="activity.coverURL" :alt="activity.activityDesc" />
            </div>

            <!-- 活动信息 -->
            <div class="activity-main">
              <h1 class="activity-title">{{ activity.activityDesc }}</h1>

              <div class="activity-meta">
                <div class="meta-row">
                  <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>开始时间：{{ formatDateTime(activity.startTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>结束时间：{{ formatDateTime(activity.endTime) }}</span>
                  </div>
                </div>

                <div class="meta-row">
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>创建人：{{ activity.userName }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><UserFilled /></el-icon>
                    <span>已报名：{{ activity.currentMemberNumber }}/{{ activity.maxMemberNumber }}</span>
                  </div>
                </div>

                <div class="meta-row">
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>创建时间：{{ formatDateTime(activity.createTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-tag :type="getStatusType(activity.status)" size="large">
                      {{ getStatusText(activity.status) }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="activity-actions">
                <el-button
                  v-if="canJoin"
                  type="primary"
                  :loading="joinLoading"
                  @click="handleJoin"
                >
                  加入活动
                </el-button>
                <el-button
                  v-if="canQuit"
                  type="warning"
                  :loading="quitLoading"
                  @click="handleQuit"
                >
                  退出活动
                </el-button>
                <el-button
                  v-if="canCancel"
                  type="danger"
                  :loading="cancelLoading"
                  @click="handleCancel"
                >
                  取消活动
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 评论区 -->
        <el-card class="comment-section">
          <template #header>
            <div class="comment-header">
              <h3>评论</h3>
              <span class="comment-count">{{ commentTotal }} 条评论</span>
            </div>
          </template>
          <CommentPanel :activity-id="activityId" @comment-count-change="handleCommentCountChange" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { detail, join, quit, cancel } from '@/api/activity'
import { ArrowLeft, Calendar, User, UserFilled, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommentPanel from '@/components/CommentPanel.vue'

const route = useRoute()
const router = useRouter()

const activityId = computed(() => Number(route.params.id))

// 数据
const loading = ref(false)
const activity = ref(null)
const joinLoading = ref(false)
const quitLoading = ref(false)
const cancelLoading = ref(false)
const commentTotal = ref(0)

// 判断是否可以加入
const canJoin = computed(() => {
  if (!activity.value) return false
  return (
    activity.value.status === 1 && // 未开始
    activity.value.currentMemberNumber < activity.value.maxMemberNumber
  )
})

// 判断是否可以退出（这里简化处理，实际需要判断是否已加入）
const canQuit = computed(() => {
  if (!activity.value) return false
  return activity.value.status === 1 // 未开始
})

// 判断是否可以取消（这里简化处理，实际需要判断是否是创建者）
const canCancel = computed(() => {
  if (!activity.value) return false
  return (
    activity.value.status === 1 || // 未开始
    activity.value.status === 2    // 正在进行中
  )
})

// 获取活动详情
const fetchActivityDetail = async () => {
  try {
    loading.value = true
    const res = await detail(activityId.value)
    activity.value = res.data
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'info',      // 未开始
    2: 'success',   // 正在进行中
    3: 'warning',   // 已结束
    4: 'danger'     // 已取消
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    1: '未开始',
    2: '正在进行中',
    3: '已结束',
    4: '已取消'
  }
  return textMap[status] || '未知'
}

// 加入活动
const handleJoin = async () => {
  try {
    joinLoading.value = true
    const res = await join(activityId.value)
    const payload = res?.data
    if (payload?.code !== 0) {
      ElMessage.error(payload?.description || payload?.message || '加入活动失败')
      return
    }
    ElMessage.success('加入活动成功')
    fetchActivityDetail()
  } catch (error) {
    console.error('加入活动失败:', error)
  } finally {
    joinLoading.value = false
  }
}

// 退出活动
const handleQuit = async () => {
  try {
    await ElMessageBox.confirm('确定要退出活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    quitLoading.value = true
    const res = await quit(activityId.value)
    const payload = res?.data
    if (payload?.code !== 0) {
      ElMessage.error(payload?.description || payload?.message || '退出活动失败')
      return
    }
    ElMessage.success('退出活动成功')
    fetchActivityDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出活动失败:', error)
    }
  } finally {
    quitLoading.value = false
  }
}

// 取消活动
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消活动吗？取消后无法恢复！', '警告', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'error'
    })

    cancelLoading.value = true
    await cancel(activityId.value)
    ElMessage.success('取消活动成功')
    fetchActivityDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消活动失败:', error)
    }
  } finally {
    cancelLoading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/activity/list')
}

// 评论数量变化
const handleCommentCountChange = (count) => {
  commentTotal.value = count
}

// 组件挂载时获取数据
onMounted(() => {
  fetchActivityDetail()
})
</script>

<style scoped lang="less">
.activity-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
}

.detail-content {
  min-height: 400px;
}

.activity-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-header {
  .header-content {
    display: flex;
    gap: 30px;
  }
}

.activity-cover {
  width: 400px;
  height: 300px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.activity-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .meta-row {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 15px;
    
    .el-icon {
      color: #909399;
      font-size: 18px;
    }
  }
}

.activity-actions {
  margin-top: 10px;
  
  .el-button {
    margin-right: 12px;
  }
}

.comment-section {
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #333;
    }
    
    .comment-count {
      color: #909399;
      font-size: 14px;
    }
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }
  
  .activity-cover {
    width: 100%;
    height: 250px;
  }
  
  .activity-meta {
    .meta-row {
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
