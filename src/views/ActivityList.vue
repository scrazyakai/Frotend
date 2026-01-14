<template>
  <div class="activity-list-container">
    <el-card class="header-card">
      <h2>活动列表</h2>
    </el-card>

    <!-- 活动列表 -->
    <div v-loading="loading" class="activity-list">
      <el-empty v-if="!loading && activities.length === 0" description="暂无活动" />

      <ActivityCard
        v-for="activity in activities"
        :key="activity.activityId"
        :activity="activity"
        :current-user-id="currentUserId"
        @click="goToDetail"
        @update="handleUpdate"
        @cancel="handleCancel"
        @join="handleJoin"
        @quit="handleQuit"
        @comment="handleComment"
      />
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActivityList, joinActivity, quitActivity, cancelActivity } from '@/api/activity'
import { Activity, ActivityStatus } from '@/api/activity'
import ActivityCard from '@/components/ActivityCard.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 数据
const loading = ref(false)
const activities = ref<Activity[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentUserId = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo)
      return parsed.userId
    } catch (e) {
      console.error('解析用户信息失败:', e)
      return null
    }
  }
  return null
})

// 获取活动列表
const fetchActivities = async () => {
  try {
    loading.value = true
    const res = await getActivityList(currentPage.value)
    activities.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
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
const getStatusType = (status: ActivityStatus) => {
  const typeMap = {
    [ActivityStatus.NOT_STARTED]: 'info',
    [ActivityStatus.IN_PROGRESS]: 'success',
    [ActivityStatus.ENDED]: 'warning',
    [ActivityStatus.CANCELLED]: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: ActivityStatus) => {
  const textMap = {
    [ActivityStatus.NOT_STARTED]: '未开始',
    [ActivityStatus.IN_PROGRESS]: '正在进行中',
    [ActivityStatus.ENDED]: '已结束',
    [ActivityStatus.CANCELLED]: '已取消'
  }
  return textMap[status] || '未知'
}

// 跳转到详情页
const goToDetail = (activityId: number) => {
  router.push(`/activity/${activityId}`)
}

// 处理更新活动
const handleUpdate = (activity: Activity) => {
  ElMessage.info('更新功能待实现')
  // TODO: 跳转到编辑页面或打开编辑对话框
}

// 处理取消活动
const handleCancel = async (activityId: number) => {
  try {
    await ElMessageBox.confirm('确定要取消这个活动吗？', '提示', {
      type: 'warning'
    })
    
    await cancelActivity(activityId)
    ElMessage.success('活动已取消')
    fetchActivities()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消活动失败:', error)
      ElMessage.error('取消活动失败')
    }
  }
}

// 处理加入活动
const handleJoin = async (activityId: number) => {
  try {
    const res = await joinActivity(activityId)
    if (res.code === 0 && res.data === true) {
      ElMessage({
        message: '成功参与',
        type: 'success',
        duration: 3000,
        offset: 100
      })
      fetchActivities()
    } else {
      const errorMsg = res.description || res.message || '加入活动失败'
      console.log('显示错误:', errorMsg)
      ElMessage({
        message: errorMsg,
        type: 'error',
        duration: 3000,
        offset: 100
      })
    }
  } catch (error: any) {
    const description = error.response?.data?.description || error.message || '加入活动失败'
    console.log('catch错误:', description)
    ElMessage({
      message: description,
      type: 'error',
      duration: 3000,
      offset: 100
    })
  }
}

// 处理退出活动
const handleQuit = async (activityId: number) => {
  try {
    const res = await quitActivity(activityId)
    if (res.code === 0 && res.data === true) {
      ElMessage({
        message: '成功退出',
        type: 'success',
        duration: 3000
      })
      fetchActivities()
    } else {
      const errorMsg = res.description || res.message || '退出活动失败'
      console.log('显示错误:', errorMsg)
      ElMessage({
        message: errorMsg,
        type: 'error',
        duration: 3000
      })
    }
  } catch (error: any) {
    const description = error.response?.data?.description || error.message || '退出活动失败'
    console.log('catch错误:', description)
    ElMessage({
      message: description,
      type: 'error',
      duration: 3000
    })
  }
}

// 处理评论
const handleComment = (activity: Activity) => {
  router.push(`/activity/${activity.activityId}`)
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchActivities()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchActivities()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchActivities()
})
</script>

<style scoped lang="less">
.activity-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #333;
  }
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  min-height: 400px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
