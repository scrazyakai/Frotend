<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { register } from '@/api/user'
import router from "@/router"

const isRegister = ref(false)

// 表单数据
const form = ref({
  account: '',
  password: '',
  confirmPassword: ''
})

// 表单实例
const formRef = ref(null)

// 确认密码校验
const validateConfirmPassword = (rule, value, callback) => {
  if (!isRegister.value) {
    callback()
    return
  }
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 动态校验规则（关键）
const rules = computed(() => ({
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 12, message: '长度 3-12 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码不能少于 8 位', trigger: 'blur' }
  ],
  confirmPassword: isRegister.value
      ? [{ validator: validateConfirmPassword, trigger: 'blur' }]
      : []
}))

// 提交
const handleSubmit = () => {
  if (!formRef.value) return

  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      // 登录
      if (!isRegister.value) {
        const res = await login({
          userAccount: form.value.account,
          userPassword: form.value.password
        })

        const { code, data, description, message } = res.data

        if (code === 0) {
          const { token, username } = data

          localStorage.setItem('token', token)
          ElMessage.success(`欢迎你，${username}`)

          await router.push('/home')
        } else {
          ElMessage.error(description || message || '登录失败')
        }
      }

      // 注册
      else {
        const res = await register({
          userAccount: form.value.account,
          userPassword: form.value.password,
          checkPassword: form.value.confirmPassword
        })

        const { code, description, message } = res.data

        if (code === 0) {
          ElMessage.success('注册成功，请登录')

          isRegister.value = false
          form.value.password = ''
          form.value.confirmPassword = ''
          formRef.value?.clearValidate()
        } else {
          // 这里就会正确显示：账号已经存在
          ElMessage.error(description || message || '注册失败')
        }
      }
    } catch (error) {
      // 只有真正异常才会走到这里
      const backendMsg =
          error?.response?.data?.description ||
          error?.response?.data?.message

      ElMessage.error(backendMsg || '请求失败，请稍后重试')
      console.error(error)
    }
  })
}



// 切换模式
const toggleMode = () => {
  isRegister.value = !isRegister.value

  // 清空数据
  form.value.account = ''
  form.value.password = ''
  form.value.confirmPassword = ''

  // 只清校验（不碰 DOM）
  formRef.value?.clearValidate()
}
</script>

<template>
  <div class="login-wrapper">
    <el-card class="login-card">
      <!-- 只动画标题，不动表单 -->
      <transition name="el-fade-in-linear" mode="out-in">
        <div class="header" :key="isRegister">
          <h2 class="title">
            {{ isRegister ? '账号注册' : '系统登录' }}
          </h2>
          <p class="subtitle">
            {{ isRegister ? '创建一个新账号' : '欢迎回来，请登录' }}
          </p>
        </div>
      </transition>

      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @keyup.enter="handleSubmit"
      >
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>

        <el-form-item
            v-show="isRegister"
            label="确认密码"
            prop="confirmPassword"
        >
          <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
          />
        </el-form-item>


        <el-button
            type="primary"
            class="submit-btn"
            @click="handleSubmit"
        >
          {{ isRegister ? '注册' : '登录' }}
        </el-button>

        <div class="switch-box">
          <el-link type="info" :underline="false" @click="toggleMode">
            {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
<style>
/* 清除浏览器默认的边距，防止出现 8px 的偏移导致滚动条 */
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* 如果你确定不需要滚动，可以直接锁定 */
}
</style>

<style scoped>

</style>
<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
}

.login-card {
  width: 360px;
  border-radius: 12px;
  padding: 20px;
  margin-left: 50%;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.title {
  font-size: 22px;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: #909399;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
}

.switch-box {
  text-align: center;
  margin-top: 16px;
}
</style>
