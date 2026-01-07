<template>
  <div class="activity-list-container">
    <el-card class="header-card">
      <h2>活动列表</h2>
    </el-card>

    <!-- 活动列表 -->
    <div v-loading="loading" class="activity-list">
      <el-empty v-if="!loading && activities.length === 0" description="暂无活动" />

      <el-card v-for="activity in activities" :key="activity.activityId" class="activity-card" shadow="hover">
        <div class="activity-content">
          <!-- 封面图 -->
          <div class="activity-cover" v-if="activity.coverURL">
            <img :src="activity.coverURL" :alt="activity.activityDesc" />
          </div>

          <!-- 活动信息 -->
          <div class="activity-info">
            <div class="activity-title">{{ activity.activityDesc }}</div>
            
            <div class="activity-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</span>
              </div>
              
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>创建人：{{ activity.userName }}</span>
              </div>
              
              <div class="meta-item">
                <el-icon><UserFilled /></el-icon>
                <span>已报名：{{ activity.currentMemberNumber }}/{{ activity.maxMemberNumber }}</span>
              </div>
            </div>

            <div class="activity-status">
              <el-tag :type="getStatusType(activity.status)">
                {{ getStatusText(activity.status) }}
              </el-tag>
            </div>

            <div class="activity-actions">
              <el-button type="primary" @click="goToDetail(activity.activityId)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActivityList } from '@/api/activity'
import { Activity, ActivityStatus } from '@/api/activity'
import { Calendar, User, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 数据
const loading = ref(false)
const activities = ref<Activity[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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
  max-width: 1200px;
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
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 400px;
}

.activity-card {
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.activity-content {
  display: flex;
  gap: 20px;
}

.activity-cover {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 14px;
    
    .el-icon {
      color: #909399;
    }
  }
}

.activity-status {
  margin-top: auto;
}

.activity-actions {
  margin-top: 12px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .activity-content {
    flex-direction: column;
  }
  
  .activity-cover {
    width: 100%;
    height: 200px;
  }
}
</style>
