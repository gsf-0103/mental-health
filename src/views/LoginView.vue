<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <div class="brand">
        <el-icon :size="36" color="#409eff"><Sunny /></el-icon>
        <h2>心理健康服务系统</h2>
        <p>心理咨询师 / 系统管理员 工作台</p>
      </div>
      <el-form :model="form" @submit.prevent="onLogin">
        <el-form-item>
          <el-input v-model="form.username" size="large" placeholder="请输入账号" :prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            size="large"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="onLogin"
          />
        </el-form-item>
        <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="onLogin">
          登 录
        </el-button>
      </el-form>
      <div class="tips">
        <p>演示账号：</p>
        <p>管理员 admin / admin123</p>
        <p>咨询师 counselor1 / 123456</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

async function onLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push(auth.isAdmin ? '/admin/dashboard' : '/counselor/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.login-card {
  width: 400px;
  padding: 24px 12px;
}
.brand {
  text-align: center;
  margin-bottom: 24px;
}
.brand h2 {
  margin: 12px 0 6px;
}
.brand p {
  color: #909399;
  font-size: 13px;
}
.tips {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
  color: #909399;
  font-size: 12px;
  line-height: 1.8;
  text-align: center;
}
</style>
