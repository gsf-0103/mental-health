<template>
  <div>
    <div class="toolbar">
      <el-radio-group v-model="status" @change="loadList">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="open">进行中</el-radio-button>
        <el-radio-button value="replied">已回复</el-radio-button>
        <el-radio-button value="closed">已结束</el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column prop="nickname" label="用户" width="120" />
      <el-table-column prop="counselor_name" label="咨询师" width="120" />
      <el-table-column prop="subject" label="主题" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评分" width="100">
        <template #default="{ row }">
          <el-rate v-if="row.rating" :model-value="row.rating" disabled size="small" />
          <span v-else style="color:#c0c4cc">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="last_message" label="最新消息" min-width="200" show-overflow-tooltip />
      <el-table-column prop="last_message_at" label="最后活跃" width="170" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const loading = ref(false)
const status = ref('')
const list = ref<any[]>([])

const statusText = (s: string) => ({ open: '进行中', replied: '已回复', closed: '已结束' }[s] || s)
const statusType = (s: string) => ({ open: 'warning', replied: 'primary', closed: 'info' }[s] || '')

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/consultations', { params: { status: status.value } })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const qs = route.query.status
  if (qs && typeof qs === 'string') status.value = qs
  loadList()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
}
</style>
