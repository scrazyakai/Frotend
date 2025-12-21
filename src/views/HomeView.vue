<script setup>
import { ref, computed, onMounted } from 'vue'
import { activity as fetchActivity } from '@/api/activity'
import { current as fetchCurrent } from '@/api/user'
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

const handleActivityClick = () => {}

onMounted(() => {
  fetchActivities()
  fetchCurrentUser()
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
                  @click="handleActivityClick"
                />
              </div>
            </div>

            <aside class="right-sidebar">
              <UserCard v-if="currentUser" :user="currentUser" />
              <div v-else class="right-placeholder">
                <el-empty description="No user info" />
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
