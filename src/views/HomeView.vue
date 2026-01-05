<script setup>
import { ref, computed, reactive, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { activity as fetchActivity, cancel as cancelActivity, update as updateActivity } from '@/api/activity'
import { current as fetchCurrent, recommend as fetchRecommend, logout as fetchLogout } from '@/api/user'
import ActivityCard from '@/components/ActivityCard.vue'
import UserCard from '@/components/UserCard.vue'
import {
  HomeFilled,
  Search,
  ChatLineRound,
  Bell,
  Setting,
  Expand,
  Fold,
  Lock,
  Brush
} from '@element-plus/icons-vue'

// 侧边栏折叠状态
const isCollapse = ref(false)
// 当前激活菜单
const activeKey = ref('home')

// 菜单配置映射
const pageMap = {
  'home': { title: '主页', icon: HomeFilled },
  'search': { title: '搜索', icon: Search },
  'message': { title: '消息中心', icon: ChatLineRound },
  'notification': { title: '系统通知', icon: Bell },
  'account': { title: '账号安全', icon: Lock },
  'theme': { title: '主题切换', icon: Brush }
}

// 计算当前页面标题
const currentPageTitle = computed(() => {
  const item = pageMap[activeKey.value]
  return item ? item.title : '未知页面'
})

// 切换折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 菜单点击回调
const handleSelect = (index) => {
  activeKey.value = index
}

const activities = ref([])
const isLoading = ref(false)
const pageNo = ref(1)
const total = ref(0)
const currentUser = ref(null)
const recommendedUsers = ref([])
const router = useRouter()
const currentUserId = computed(() => {
  const user = currentUser.value
  return user?.id ?? user?.userId ?? user?.userID ?? user?.user_id ?? null
})

const editDialogVisible = ref(false)
const originalActivity = ref(null)
const editForm = reactive({
  activityId: null,
  activityDesc: '',
  startTime: '',
  endTime: '',
  coverURL: '',
  maxMemberNumber: null
})

const openEditDialog = (activity) => {
  originalActivity.value = { ...(activity ?? {}) }
  editForm.activityId = activity?.activityId ?? null
  editForm.activityDesc = activity?.activityDesc ?? ''
  editForm.startTime = activity?.startTime ?? ''
  editForm.endTime = activity?.endTime ?? ''
  editForm.coverURL = activity?.coverURL ?? ''
  editForm.maxMemberNumber = activity?.maxMemberNumber ?? null
  editDialogVisible.value = true
}


const fetchActivities = async () => {
  isLoading.value = true
  try {
    const res = await fetchActivity(pageNo.value)
    const payload = res?.data?.data
    activities.value = Array.isArray(payload?.records) ? payload.records : []
    total.value = payload?.total ?? 0
  } catch (error) {
    activities.value = []
    total.value = 0
  } finally {
    isLoading.value = false
  }
}

const fetchCurrentUser = async () => {
  try {
    const res = await fetchCurrent()
    currentUser.value = res?.data?.data ?? null
  } catch (error) {
    currentUser.value = null
  }
}

const fetchRecommendedUsers = async () => {
  try {
    const res = await fetchRecommend()
    const payload = res?.data?.data
    recommendedUsers.value = Array.isArray(payload) ? payload : []
  } catch (error) {
    recommendedUsers.value = []
  }
}

const handleUserSwitch = async () => {
  try {
    await fetchLogout()
  } finally {
    localStorage.removeItem('token')
    router.replace('/login')
  }
}

const handleActivityClick = () => {}
const handleActivityCancel = async (activityId) => {
  try {
    await cancelActivity(activityId)
    fetchActivities()
  } catch (error) {
    // ignore for now
  }
}
const handleActivityUpdate = (activity) => {
  openEditDialog(activity)
}

const submitActivityUpdate = async () => {
  try {
    const payload = { ...(originalActivity.value ?? {}), ...editForm }
    await updateActivity(payload)
    editDialogVisible.value = false
    fetchActivities()
  } catch (error) {
    // ignore for now
  }
}


onMounted(() => {
  fetchActivities()
  fetchCurrentUser()
  fetchRecommendedUsers()
})

onActivated(() => {
  fetchCurrentUser()
  fetchRecommendedUsers()
})
</script>

<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar-aside">
        <!-- Logo 区域 -->
        <div class="logo-container">
          <div class="logo-icon">V</div>
          <span v-show="!isCollapse" class="logo-text">Find Companions</span>
        </div>

        <!-- 菜单区域 -->
        <el-menu
            :default-active="activeKey"
            :collapse="isCollapse"
            class="el-menu-vertical"
            @select="handleSelect"
        >
          <el-menu-item index="home">
            <el-icon><HomeFilled /></el-icon>
            <template #title><span>主页</span></template>
          </el-menu-item>

          <el-menu-item index="search">
            <el-icon><Search /></el-icon>
            <template #title><span>搜索</span></template>
          </el-menu-item>

          <el-menu-item index="message">
            <el-icon><ChatLineRound /></el-icon>
            <template #title>
              <div class="menu-title-content">
                <span>消息</span>
              </div>
            </template>
          </el-menu-item>

          <el-menu-item index="notification">
            <el-icon><Bell /></el-icon>
            <template #title>
              <div class="menu-title-content">
                <span>通知</span>
                <el-badge is-dot type="warning" class="badge-dot" />
              </div>
            </template>
          </el-menu-item>

          <div class="menu-divider"></div>

          <el-sub-menu index="settings">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </template>
            <el-menu-item index="account">账号安全</el-menu-item>
            <el-menu-item index="theme">主题切换</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <el-header class="content-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </el-header>

        <el-main class="content-main">
          <div v-if="activeKey === 'home'" class="home-panel">
            <div class="activity-section">
              <div v-if="!isLoading && activities.length === 0" class="empty-wrap">
                <el-empty description="No activities" />
              </div>

              <div class="activity-grid" v-loading="isLoading">
                <ActivityCard
                  v-for="(item, index) in activities"
                  :key="item.activityId ?? `${item.ownerId}-${index}`"
                  :activity="item"
                  :current-user-id="currentUserId"
                  @click="handleActivityClick"
                  @cancel="handleActivityCancel"
                  @update="handleActivityUpdate"
                />
              </div>
            </div>


            <el-dialog v-model="editDialogVisible" title="更改活动内容" width="520px">
              <el-form label-width="96px">
                <el-form-item label="活动描述">
                  <el-input v-model="editForm.activityDesc" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item label="开始时间">
                  <el-date-picker
                    v-model="editForm.startTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择开始时间"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="结束时间">
                  <el-date-picker
                    v-model="editForm.endTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择结束时间"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="封面">
                  <el-input v-model="editForm.coverURL" placeholder="请输入封面URL" />
                </el-form-item>
                <el-form-item label="最大人数">
                  <el-input-number v-model="editForm.maxMemberNumber" :min="1" style="width: 100%" />
                </el-form-item>
              </el-form>
              <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitActivityUpdate">保存</el-button>
              </template>
            </el-dialog>

            <aside class="right-sidebar">
              <UserCard v-if="currentUser" :user="currentUser" @switch="handleUserSwitch" />
              <div v-else class="right-placeholder">
                <el-empty description="No user info" />
              </div>
              <div class="recommend-panel">
                <div class="recommend-title">推荐用户</div>
                <div class="recommend-frame">
                  <div v-if="recommendedUsers.length" class="recommend-list">
                    <UserCard
                      v-for="(item, index) in recommendedUsers"
                      :key="item.userAccount ?? `${item.username}-${index}`"
                      :user="item"
                      :show-account="false"
                      :show-switch="false"
                    />
                  </div>
                  <div v-else class="recommend-empty">
                    <el-empty description="No recommendations" />
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div v-else class="page-card">
            <h2>{{ currentPageTitle }} Content</h2>
            <p>Active key {{ activeKey }}</p>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="less">
/* 关键修复：确保容器占满全屏 */
.common-layout {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}

.layout-container {
  height: 100%;
}

/* 颜色变量：调整为白蓝渐变风格 */
@sidebar-bg-start: #ffffff;
@sidebar-bg-end: #e6f1ff;
@sidebar-active: rgba(64, 158, 255, 0.1);
@text-color: #57606a;
@text-active: #409eff;
@primary-color: #409eff;

.sidebar-aside {
  /* 设置白蓝渐变背景 */
  background: linear-gradient(180deg, @sidebar-bg-start 0%, @sidebar-bg-end 100%);
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(64, 158, 255, 0.2);
  height: 100%;

  .logo-container {
    height: 80px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: rgba(64, 158, 255, 0.05);
    flex-shrink: 0;

    .logo-icon {
      width: 32px;
      height: 32px;
      background: @primary-color;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
  
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
    }

    .logo-text {
      margin-left: 12px;
      color: @primary-color;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  .el-menu-vertical {
    border-right: none;
    background: transparent;
    flex: 1;
    overflow-y: auto;

    :deep(.el-menu-item) {
      color: @text-color;

      i { color: inherit; }

      &:hover {
        background-color: @sidebar-active !important;
        color: @text-active !important;
      }

      &.is-active {
        background-color: @sidebar-active !important;
        color: @text-active !important;
        font-weight: bold;
        border-radius: 10%;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          width: 3px;
          height: 100%;
          background: @primary-color;
        }
      }
    }

    :deep(.el-sub-menu__title) {
      color: @text-color;
      &:hover {
        background-color: @sidebar-active !important;
        color: @text-active !important;
      }
    }
  }

  .menu-divider {
    height: 1px;
    background: rgba(64, 158, 255, 0.1);
    margin: 10px 15px;
  }

  .collapse-footer {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: @text-color;
    cursor: pointer;
    border-top: 1px solid rgba(64, 158, 255, 0.1);
    flex-shrink: 0;

    &:hover {
      color: @primary-color;
      background: @sidebar-active;
    }
  }
}

.menu-title-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .badge-dot {
    margin-right: 18px;
  }
}

.main-container {
  background-color: #f8fafc;
  height: 100%;

  .content-header {
    background: white;
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid #eef2f6;
    height: 60px;
    flex-shrink: 0;
  }

  .content-main {
    padding: 20px;
    overflow-y: auto;

    .page-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      min-height: calc(100% - 40px);
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid #f0f3f7;

      h2 { color: #334155; margin-bottom: 10px; }
      p { color: #64748b; }
    }

    .activity-section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      min-height: calc(100% - 40px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid #f0f3f7;
    }

    .home-panel {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) 280px;
      gap: 20px;
      align-items: start;
    }

    .right-sidebar {
      position: sticky;
      top: 20px;
      align-self: start;
    }

    .right-placeholder {
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid #f0f3f7;
    }

    .recommend-panel {
      margin-top: 16px;
      padding: 8px 0 0;
    }

    .recommend-title {
      font-size: 18px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 12px;
    }

    .recommend-frame {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(234, 244, 255, 0.7) 100%);
      border: 1px solid rgba(148, 197, 255, 0.35);
      border-radius: 16px;
      padding: 14px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(16px) saturate(140%);
      -webkit-backdrop-filter: blur(16px) saturate(140%);
    }

    .recommend-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .recommend-empty {
      padding: 12px 0 4px;
    }
    .activity-meta {
      color: #64748b;
      font-size: 13px;
    }

    .activity-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      justify-items: center;
      justify-content: center;
    }

    .empty-wrap {
      margin: 20px 0;
    }
  }
}
</style>
