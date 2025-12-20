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
import { computed } from 'vue'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

/** 状态文案 */
const statusText = computed(() => {
  switch (props.activity.status) {
    case 1:
      return '未开始'
    case 2:
      return '进行中'
    case 3:
      return '已结束'
    case 4:
      return '已取消'
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
      return 'warning'
    case 4:
      return 'danger'
    default:
      return ''
  }
})

const handleClick = () => {
  emit('click', props.activity.activityId)
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
  height: 320px;
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
}
</style>
