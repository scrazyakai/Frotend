<template>
  <div class="comment-panel">
    <!-- 发布评论 -->
    <div class="comment-input-area">
      <el-input
        v-model="commentContent"
        type="textarea"
        :rows="3"
        placeholder="发表评论..."
        :maxlength="500"
        show-word-limit
      />
      <div class="input-actions">
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitComment">
          发表评论
        </el-button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-loading="loading" class="comment-list">
      <el-empty v-if="!loading && comments.length === 0" description="暂无评论" />

      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <!-- 一级评论 -->
        <div class="comment-main">
          <!-- 用户头像和信息 -->
          <div class="comment-user">
            <el-avatar :size="40" :src="comment.userAvatarURL">
              {{ comment.userName.charAt(0) }}
            </el-avatar>
            <div class="user-info">
              <div class="user-name">{{ comment.userName }}</div>
              <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
            </div>
          </div>

          <!-- 评论内容 -->
          <div class="comment-content">
            <div class="content-text">{{ comment.content }}</div>
            <el-image
              v-if="comment.imageURL"
              :src="comment.imageURL"
              :preview-src-list="[comment.imageURL]"
              fit="cover"
              class="comment-image"
            />
          </div>

          <!-- 评论操作 -->
          <div class="comment-actions">
            <div class="action-item" :class="{ 'is-liked': comment.isLiked }" @click="handleLike(comment)">
              <span class="action-icon">
                <svg v-if="!comment.isLiked" class="like-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path d="M890.908 429.534c-20.66-26.05-51.585-40.99-84.84-40.99l-189.34 0c10.34-28.83 17.18-60.165 19.615-90.48 3.785-47.147-3.465-89.02-20.955-121.095-21.53-39.46-58.18-64.072-105.997-71.177-21.662-3.22-40.292 0.945-55.377 12.372-30.495 23.102-36.092 67.065-42.575 117.97-5.182 40.692-11.055 86.817-30.79 119.877-13.172 22.065-38.807 51.397-109.092 51.397l-73.345 0c-48.842 0-88.58 39.722-88.58 88.545l0 334.754c0 48.82 39.737 88.545 88.58 88.545l534.336 0c24.33 0 48.22-8.325 67.275-23.43 19.06-15.11 32.605-36.475 38.145-60.155l73.52-314.264C919.058 489.054 911.553 455.569 890.908 429.534zM168.672 830.708 168.672 495.956c0-16.27 13.252-29.505 29.537-29.505l62.232 0 0 393.762-62.232 0C181.925 860.213 168.672 846.978 168.672 830.708zM853.998 507.956l-73.52 314.272c-5.23 22.36-24.94 37.985-47.93 37.985L319.484 860.213 319.484 462.169c49.877-9.52 87.4-34.92 111.86-75.895 26.05-43.64 32.75-96.257 38.662-142.68 2.67-20.977 5.193-40.79 9.2-55.99 4.297-16.302 8.745-21.08 10.457-22.377 1.96-1.485 5.677-1.835 11.05-1.035 29.615 4.4 50.175 17.83 62.84 41.052 25.99 47.642 14.505 128.052-10.265 182.86-5.93 13.127-4.83 28.167 2.96 40.232 7.78 12.052 21.01 19.247 35.395 19.247l214.424 0c15.125 0 29.185 6.792 38.58 18.637C854.028 478.049 857.438 493.261 853.998 507.956z" fill="#272636"></path>
                </svg>
                <svg v-else class="like-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path d="M64 483.04V872c0 37.216 30.144 67.36 67.36 67.36H192V416.32l-60.64-0.64A67.36 67.36 0 0 0 64 483.04zM857.28 344.992l-267.808 1.696c12.576-44.256 18.944-83.584 18.944-118.208 0-78.56-68.832-155.488-137.568-145.504-60.608 8.8-67.264 61.184-67.264 126.816v59.264c0 76.064-63.84 140.864-137.856 148L256 416.96v522.4h527.552a102.72 102.72 0 0 1 100.928-83.584l73.728-388.96a102.72 102.72 0 0 0-100.928-121.824z" fill="#1296db"></path>
                </svg>
              </span>
              <span>点赞 ({{ comment.likeTotal }})</span>
            </div>
            <div class="action-item" @click="toggleReply(comment)">
              <el-icon><ChatDotRound /></el-icon>
              <span>回复 ({{ comment.replyTotal }})</span>
            </div>
            <div
              v-if="canEditComment(comment)"
              class="action-item"
              @click="handleEdit(comment)"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </div>
            <div
              v-if="canDeleteComment(comment)"
              class="action-item danger"
              @click="handleDelete(comment)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </div>
          </div>

          <!-- 回复区域 -->
          <div v-if="expandedReplyId === comment.id" class="reply-section">
            <div class="reply-input">
              <el-input
                v-model="replyContent"
                placeholder="回复评论..."
                :maxlength="200"
                show-word-limit
              />
              <div class="reply-actions">
                <el-button size="small" @click="cancelReply">取消</el-button>
                <el-button type="primary" size="small" :loading="replyLoading" @click="handleReply(comment)">
                  回复
                </el-button>
              </div>
            </div>

            <!-- 回复列表 -->
            <div class="reply-list">
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-item"
              >
                <div class="reply-user">
                  <el-avatar :size="32" :src="reply.userAvatarURL">
                    {{ reply.userName.charAt(0) }}
                  </el-avatar>
                  <div class="user-info">
                    <div class="user-name">{{ reply.userName }}</div>
                    <div class="comment-time">{{ formatTime(reply.createTime) }}</div>
                  </div>
                </div>

                <div class="reply-content">
                  <div class="content-text">{{ reply.content }}</div>
                  <el-image
                    v-if="reply.imageURL"
                    :src="reply.imageURL"
                    :preview-src-list="[reply.imageURL]"
                    fit="cover"
                    class="comment-image"
                  />
                </div>

                <div class="reply-actions">
                  <div class="action-item" :class="{ 'is-liked': reply.isLiked }" @click="handleLike(reply)">
                    <span class="action-icon">
                      <svg v-if="!reply.isLiked" class="like-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path d="M890.908 429.534c-20.66-26.05-51.585-40.99-84.84-40.99l-189.34 0c10.34-28.83 17.18-60.165 19.615-90.48 3.785-47.147-3.465-89.02-20.955-121.095-21.53-39.46-58.18-64.072-105.997-71.177-21.662-3.22-40.292 0.945-55.377 12.372-30.495 23.102-36.092 67.065-42.575 117.97-5.182 40.692-11.055 86.817-30.79 119.877-13.172 22.065-38.807 51.397-109.092 51.397l-73.345 0c-48.842 0-88.58 39.722-88.58 88.545l0 334.754c0 48.82 39.737 88.545 88.58 88.545l534.336 0c24.33 0 48.22-8.325 67.275-23.43 19.06-15.11 32.605-36.475 38.145-60.155l73.52-314.264C919.058 489.054 911.553 455.569 890.908 429.534zM168.672 830.708 168.672 495.956c0-16.27 13.252-29.505 29.537-29.505l62.232 0 0 393.762-62.232 0C181.925 860.213 168.672 846.978 168.672 830.708zM853.998 507.956l-73.52 314.272c-5.23 22.36-24.94 37.985-47.93 37.985L319.484 860.213 319.484 462.169c49.877-9.52 87.4-34.92 111.86-75.895 26.05-43.64 32.75-96.257 38.662-142.68 2.67-20.977 5.193-40.79 9.2-55.99 4.297-16.302 8.745-21.08 10.457-22.377 1.96-1.485 5.677-1.835 11.05-1.035 29.615 4.4 50.175 17.83 62.84 41.052 25.99 47.642 14.505 128.052-10.265 182.86-5.93 13.127-4.83 28.167 2.96 40.232 7.78 12.052 21.01 19.247 35.395 19.247l214.424 0c15.125 0 29.185 6.792 38.58 18.637C854.028 478.049 857.438 493.261 853.998 507.956z" fill="#272636"></path>
                      </svg>
                      <svg v-else class="like-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path d="M64 483.04V872c0 37.216 30.144 67.36 67.36 67.36H192V416.32l-60.64-0.64A67.36 67.36 0 0 0 64 483.04zM857.28 344.992l-267.808 1.696c12.576-44.256 18.944-83.584 18.944-118.208 0-78.56-68.832-155.488-137.568-145.504-60.608 8.8-67.264 61.184-67.264 126.816v59.264c0 76.064-63.84 140.864-137.856 148L256 416.96v522.4h527.552a102.72 102.72 0 0 1 100.928-83.584l73.728-388.96a102.72 102.72 0 0 0-100.928-121.824z" fill="#1296db"></path>
                      </svg>
                    </span>
                    <span>点赞 ({{ reply.likeTotal }})</span>
                  </div>
                  <div
                    v-if="canEditComment(reply)"
                    class="action-item"
                    @click="handleEdit(reply)"
                  >
                    <el-icon><Edit /></el-icon>
                    <span>编辑</span>
                  </div>
                  <div
                    v-if="canDeleteComment(reply)"
                    class="action-item danger"
                    @click="handleDelete(reply)"
                  >
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </div>
                </div>
              </div>

              <el-button
                v-if="comment.replyTotal > (comment.replies?.length || 0)"
                link
                @click="loadMoreReplies(comment)"
                class="load-more-btn"
              >
                加载更多回复
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑评论对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑评论" width="500px">
      <el-input
        v-model="editContent"
        type="textarea"
        :rows="4"
        placeholder="请输入评论内容"
        :maxlength="500"
        show-word-limit
      />
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleUpdateComment">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getCommentList,
  getReplyList,
  addComment,
  deleteComment,
  updateComment,
  toggleLikeComment
} from '@/api/comment'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, StarFilled, ChatDotRound, Edit, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  activityId: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['comment-count-change'])

// 获取当前登录用户ID
const currentUserId = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.id || userInfo.userId || userInfo.userID || userInfo.user_id || null
    } catch (e) {
      return null
    }
  }
  return null
})

// 数据
const loading = ref(false)
const comments = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 评论输入
const commentContent = ref('')
const submitLoading = ref(false)

// 回复
const replyContent = ref('')
const replyLoading = ref(false)
const expandedReplyId = ref(null)
const replyPageMap = ref({})

// 编辑
const editDialogVisible = ref(false)
const editContent = ref('')
const editLoading = ref(false)
const editingComment = ref(null)

// 获取评论列表
const fetchComments = async () => {
  try {
    loading.value = true
    const res = await getCommentList(props.activityId, currentPage.value, pageSize.value)
    
    // 处理响应数据
    let responseData
    if (res.data && res.data.data && res.data.data.records) {
      // 响应结构: {data: {code: 0, data: {records: [...], total: 2, ...}}}
      responseData = res.data.data
    } else if (res.data && res.data.records) {
      // 响应结构: {code: 0, data: {records: [...], total: 2, ...}}
      responseData = res.data
    } else if (res.records) {
      // 响应结构: {records: [...], total: 2, ...}
      responseData = res
    } else {
      console.error('响应数据格式不正确:', res)
      comments.value = []
      total.value = 0
      return
    }
    
    comments.value = responseData.records.map(item => ({ ...item, replies: [] }))
    total.value = responseData.total
    emit('comment-count-change', total.value)
  } catch (error) {
    console.error('获取评论列表失败:', error)
    comments.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取回复列表
const fetchReplies = async (commentId, page = 1) => {
  try {
    const res = await getReplyList(commentId, page, pageSize.value)
    const comment = comments.value.find(c => c.id === commentId)
    
    // 处理响应数据
    let responseData
    if (res.data && res.data.data && res.data.data.records) {
      responseData = res.data.data
    } else if (res.data && res.data.records) {
      responseData = res.data
    } else if (res.records) {
      responseData = res
    } else {
      console.error('响应数据格式不正确:', res)
      return
    }
    
    if (comment) {
      if (page === 1) {
        comment.replies = responseData.records
      } else {
        comment.replies = [...(comment.replies || []), ...responseData.records]
      }
      replyPageMap.value[commentId] = page
    }
  } catch (error) {
    console.error('获取回复列表失败:', error)
  }
}

// 格式化时间
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 提交评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    submitLoading.value = true
    await addComment({
      activityId: props.activityId,
      content: commentContent.value
    })
    ElMessage.success('评论成功')
    commentContent.value = ''
    currentPage.value = 1
    await fetchComments()
  } catch (error) {
    console.error('评论失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 展开/收起回复
const toggleReply = async (comment) => {
  if (expandedReplyId.value === comment.id) {
    expandedReplyId.value = null
  } else {
    expandedReplyId.value = comment.id
    if (!comment.replies || comment.replies.length === 0) {
      await fetchReplies(comment.id, 1)
    }
  }
}

// 回复评论
const handleReply = async (comment) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  try {
    replyLoading.value = true
    await addComment({
      activityId: props.activityId,
      parentId: comment.id,
      content: replyContent.value
    })
    ElMessage.success('回复成功')
    replyContent.value = ''
    await fetchReplies(comment.id, 1)
    // 更新回复总数
    comment.replyTotal++
  } catch (error) {
    console.error('回复失败:', error)
  } finally {
    replyLoading.value = false
  }
}

// 取消回复
const cancelReply = () => {
  replyContent.value = ''
  expandedReplyId.value = null
}

// 加载更多回复
const loadMoreReplies = async (comment) => {
  const currentPage = replyPageMap.value[comment.id] || 1
  await fetchReplies(comment.id, currentPage + 1)
}

// 点赞
const handleLike = async (comment) => {
  try {
    const res = await toggleLikeComment(comment.id)
    // 处理响应数据
    let likeTotal
    if (res.code === 0 && res.data !== undefined) {
      // 响应结构: {code: 0, data: 0, ...}
      likeTotal = res.data
    } else if (res.data && res.data.data !== undefined) {
      // 响应结构: {data: {code: 0, data: 0, ...}}
      likeTotal = res.data.data
    } else if (res.data !== undefined) {
      likeTotal = res.data
    } else {
      likeTotal = comment.likeTotal
    }
    comment.likeTotal = likeTotal
    comment.isLiked = !comment.isLiked
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 判断是否可以编辑评论
const canEditComment = (comment) => {
  if (!currentUserId.value) return false
  return String(comment.userId) === String(currentUserId.value)
}

// 判断是否可以删除评论
const canDeleteComment = (comment) => {
  if (!currentUserId.value) return false
  return String(comment.userId) === String(currentUserId.value)
}

// 编辑评论
const handleEdit = (comment) => {
  editingComment.value = comment
  editContent.value = comment.content
  editDialogVisible.value = true
}

// 更新评论
const handleUpdateComment = async () => {
  if (!editContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  if (!editingComment.value) return

  try {
    editLoading.value = true
    const res = await updateComment({
      commentId: editingComment.value.id,
      content: editContent.value
    })
    
    // 检查响应是否成功
    if (res && res.code === 0) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      
      // 更新本地数据
      if (editingComment.value.level === 1) {
        const comment = comments.value.find(c => c.id === editingComment.value.id)
        if (comment) comment.content = editContent.value
      } else {
        // 更新回复
        comments.value.forEach(comment => {
          const reply = comment.replies?.find(r => r.id === editingComment.value.id)
          if (reply) reply.content = editContent.value
        })
      }
    } else {
      // 后端返回错误
      ElMessage.error(res?.message || '更新失败，请检查权限')
    }
  } catch (error) {
    // 请求失败或被响应拦截器拦截
    console.error('更新评论失败:', error)
    // 响应拦截器已经显示了错误信息，这里不需要重复显示
  } finally {
    editLoading.value = false
  }
}

// 删除评论
const handleDelete = async (comment) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteComment(comment.id)
    
    // 检查响应是否成功
    if (res && res.code === 0) {
      ElMessage.success('删除成功')

      if (comment.level === 1) {
        // 删除一级评论
        comments.value = comments.value.filter(c => c.id !== comment.id)
        total.value--
      } else {
        // 删除回复
        comments.value.forEach(c => {
          if (c.id === comment.parentId) {
            c.replies = c.replies?.filter(r => r.id !== comment.id)
            c.replyTotal--
          }
        })
      }
      
      emit('comment-count-change', total.value)
    } else {
      // 后端返回错误
      ElMessage.error(res?.message || '删除失败，请检查权限')
    }
  } catch (error) {
    // 请求失败或被响应拦截器拦截，或者用户取消了操作
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      // 响应拦截器已经显示了错误信息，这里不需要重复显示
    }
  }
}

// 页码改变
const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchComments()
})
</script>

<style scoped lang="less">
.comment-panel {
  .comment-input-area {
    margin-bottom: 24px;
    
    .input-actions {
      margin-top: 12px;
      text-align: right;
    }
  }

  .comment-list {
    min-height: 200px;
  }

  .comment-item {
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-main {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 150px;
  }

  .comment-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user-name {
    font-weight: 500;
    color: #333;
    font-size: 15px;
  }

  .comment-time {
    color: #999;
    font-size: 13px;
  }

  .comment-content {
    margin-left: 52px;
  }

  .content-text {
    color: #333;
    line-height: 1.6;
    font-size: 15px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment-image {
    margin-top: 12px;
    max-width: 300px;
    max-height: 300px;
    border-radius: 8px;
  }

  .comment-actions {
    margin-left: 52px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: #666;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }

    .el-icon {
      font-size: 16px;
    }

  .action-icon {
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .like-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
    
    .action-item:hover & {
      transform: scale(1.2);
    }
  }

    &.danger:hover {
      color: #f56c6c;
    }

    &.is-liked {
      color: #409eff;
    }
  }

  .reply-section {
    margin-left: 52px;
    margin-top: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .reply-input {
    margin-bottom: 16px;

    .reply-actions {
      margin-top: 12px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }

  .reply-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .reply-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .reply-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reply-content {
    margin-left: 42px;
  }

  .reply-actions {
    margin-left: 42px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .load-more-btn {
    width: 100%;
    margin-top: 12px;
  }

  .pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .comment-content,
  .comment-actions,
  .reply-section {
    margin-left: 0;
  }

  .reply-content,
  .reply-actions {
    margin-left: 0;
  }
}
</style>
