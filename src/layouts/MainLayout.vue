<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon :size="22" color="#fff"><Sunny /></el-icon>
        <span>心理健康服务系统</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#1f2d3d"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <template v-if="auth.isCounselor">
          <el-menu-item index="/counselor/dashboard">
            <el-icon><DataLine /></el-icon><span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/counselor/profiles">
            <el-icon><Folder /></el-icon><span>用户心理档案</span>
          </el-menu-item>
          <el-menu-item index="/counselor/appointments">
            <el-icon><Calendar /></el-icon><span>预约管理</span>
          </el-menu-item>
          <el-menu-item index="/counselor/consultations">
            <el-icon><ChatDotRound /></el-icon><span>在线咨询</span>
          </el-menu-item>
          <el-menu-item index="/counselor/articles">
            <el-icon><Notebook /></el-icon><span>科普文章</span>
          </el-menu-item>
        </template>
        <template v-else>
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataAnalysis /></el-icon><span>数据总览</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon><span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/counselors">
            <el-icon><Avatar /></el-icon><span>咨询师账号</span>
          </el-menu-item>
          <el-menu-item index="/admin/appointments">
            <el-icon><Calendar /></el-icon><span>预约审核</span>
          </el-menu-item>
          <el-menu-item index="/admin/consultations">
            <el-icon><ChatDotRound /></el-icon><span>在线咨询</span>
          </el-menu-item>
          <el-menu-item index="/admin/assessments">
            <el-icon><EditPen /></el-icon><span>测评题库</span>
          </el-menu-item>
          <el-menu-item index="/admin/articles">
            <el-icon><Notebook /></el-icon><span>文章管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/announcements">
            <el-icon><Bell /></el-icon><span>公告管理</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="title">{{ route.meta.title }}</div>
        <el-dropdown @command="onCommand">
          <span class="user-info">
            <el-avatar :size="30" style="background: #409eff">
              {{ auth.user?.realName?.charAt(0) }}
            </el-avatar>
            <span style="margin-left: 8px">{{ auth.user?.realName }}</span>
            <el-tag
              size="small"
              :type="auth.isAdmin ? 'danger' : 'success'"
              style="margin-left: 8px"
            >
              {{ auth.isAdmin ? '系统管理员' : auth.user?.title || '心理咨询师' }}
            </el-tag>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

async function onCommand(cmd: string) {
  if (cmd === 'logout') {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background: #1f2d3d;
  overflow-y: auto;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  padding: 0 16px;
  white-space: nowrap;
}
.aside :deep(.el-menu) {
  border-right: none;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
}
.header .title {
  font-size: 16px;
  font-weight: 600;
}
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
