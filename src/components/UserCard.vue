<template>
  <div class="user-card">
    <div class="avatar">
      <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="user avatar" />
      <div v-else class="avatar-fallback">U</div>
    </div>
    <div class="info">
      <div class="primary">
        {{ showAccount ? (user?.userAccount || '') : (user?.username || '') }}
      </div>
      <div class="secondary">
        {{ showAccount ? (user?.username || '') : (user?.profile || '') }}
      </div>
    </div>
    <button v-if="showSwitch" class="switch-btn" type="button" @click="emit('switch')">切换</button>
  </div>
</template>

<script setup>
const emit = defineEmits(['switch'])

defineProps({
  user: {
    type: Object,
    required: true
  },
  showAccount: {
    type: Boolean,
    default: true
  },
  showSwitch: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 12px;
  color: #1f2937;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  gap: 16px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #6b7280;
}

.info {
  flex: 1;
  min-width: 0;
}

.primary {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.secondary {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.switch-btn {
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 8px;
}

.switch-btn:hover {
  color: #2563eb;
}
</style>
