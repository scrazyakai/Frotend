<template>
  <el-card class="activity-card" shadow="hover" @click="handleClick">
    <!-- 封面 -->
    <div class="cover">
      <img :src="activity.coverURL" alt="activity cover" />
      <el-tag
          class="status-tag"
          :type="statusType"
          size="small"
      >
        {{ statusText }}
      </el-tag>
    </div>

    <!-- 内容 -->
    <div class="content">
      <div class="desc">
        {{ activity.activityDesc }}
      </div>
      <!-- 操作按钮 -->
      <div class="actions">
        <!-- 所有者按钮 -->
        <template v-if="isOwner">
          <el-button size="small" type="primary" @click.stop="handleUpdate">更改活动内容</el-button>
          <el-button
            v-if="activity.status !== 3"
            size="small"
            type="danger"
            @click.stop="handleCancel"
          >
            取消活动
          </el-button>
        </template>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-actions">
        <div class="left-actions">
          <!-- 参与人数信息 -->
          <div class="member-info">
            <el-icon><User /></el-icon>
            <span>{{ activity.currentMemberNumber }}/{{ activity.maxMemberNumber }}</span>
          </div>
          
          <!-- 参与/退出按钮 -->
          <el-button
            v-if="activity.status === 1"
            size="small"
            :type="isParticipating ? 'warning' : 'success'"
            @click.stop="isParticipating ? handleQuit() : handleJoin()"
          >
            {{ isParticipating ? '退出活动' : '参与活动' }}
          </el-button>
        </div>
        
        <div class="comment-btn" @click.stop="handleComment">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论</span>
        </div>
      </div>

      <!-- 用户信息 -->
      <div class="user">
        <el-avatar
            :size="48"
            :src="activity.userAvatarURL"
        />
        <span class="username">{{ activity.userName }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { User, ChatDotRound } from '@element-plus/icons-vue'
import { checkParticipant } from '@/api/activity'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: [Number, String],
    default: null
  },
  isParticipating: {
    type: Boolean,
    default: undefined
  }
})

const emit = defineEmits(['click', 'update', 'cancel', 'join', 'quit', 'comment'])

// 是否参与该活动（本地状态）
const localIsParticipating = ref(false)

// 使用 props 或本地状态
const isParticipating = computed(() => {
  if (props.isParticipating !== undefined) {
    return props.isParticipating
  }
  return localIsParticipating.value
})

/** 状态文案 */
const statusText = computed(() => {
  switch (props.activity.status) {
    case 1:
      return '未开始'
    case 2:
      return '进行中'
    case 3:
      return '已取消'
    case 4:
      return '已结束'
    default:
      return '未知'
  }
})

/** 状态颜色 */
const statusType = computed(() => {
  switch (props.activity.status) {
    case 1:
      return 'info'
    case 2:
      return 'success'
    case 3:
      return 'danger'
    case 4:
      return 'warning'
    default:
      return ''
  }
})

const isOwner = computed(() => {
  const ownerId = props.activity?.ownerId
  const currentUserId = props.currentUserId
  if (ownerId == null || currentUserId == null) {
    return false
  }
  return String(ownerId) === String(currentUserId)
})

// 检查当前用户是否参与了活动
const checkIfParticipated = async () => {
  // 如果 props 已经提供了 isParticipating，则不需要检查
  if (props.isParticipating !== undefined) {
    return
  }
  
  if (!props.currentUserId) {
    localIsParticipating.value = false
    return
  }
  
  try {
    const res = await checkParticipant(props.activity.activityId)
    // 后端返回 {code: 0, data: boolean, ...}
    // res.data.data 才是实际的参与状态
    localIsParticipating.value = res.data.data === true
  } catch (error) {
    localIsParticipating.value = false
  }
}

// 监听 activityId 变化，重新检查参与状态
watch(() => props.activity?.activityId, (newId) => {
  if (newId && props.isParticipating === undefined) {
    checkIfParticipated()
  }
}, { immediate: true })

// 监听 activity 对象变化，重新检查参与状态
watch(() => props.activity, (newActivity) => {
  if (newActivity && props.isParticipating === undefined) {
    checkIfParticipated()
  }
}, { deep: true })

const handleClick = () => {
  emit('click', props.activity.activityId)
}

const handleUpdate = () => {
  emit('update', props.activity)
}

const handleCancel = () => {
  emit('cancel', props.activity.activityId)
}

const handleJoin = () => {
  emit('join', props.activity.activityId)
}

const handleQuit = () => {
  emit('quit', props.activity.activityId)
}

const handleComment = () => {
  emit('comment', props.activity)
}
</script>

<style scoped lang="less">
.activity-card {
  width: 100%;
  height: 100%;
  align-items: center;
  justify-self: center;
  cursor: pointer;
  padding: 0;
}

.cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 2%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .status-tag {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}

.content {
  padding: 20px;

  .desc {
    font-size: 16px;
    line-height: 1.5;
    height: 84px;
    overflow: hidden;
    color: #333;
  }

  .user {
    display: flex;
    align-items: center;
    margin-top: 16px;

    .username {
      margin-left: 8px;
      font-size: 15px;
      color: #666;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: center;
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 6px;
    color: #606266;
    font-size: 14px;
    min-width: 120px;
    max-width: 140px;

    .el-icon {
      color: #909399;
    }
  }

  .bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    flex-wrap: wrap;

    .left-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }
  }

  .comment-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #f0f9ff;
    color: #409eff;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;

    &:hover {
      background: #e1f5fe;
      transform: translateY(-1px);
    }

    .el-icon {
      font-size: 16px;
    }
  }
}
</style>
