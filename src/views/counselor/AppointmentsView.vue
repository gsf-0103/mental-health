<template>
  <div>
    <div class="toolbar">
      <el-radio-group v-model="status" @change="loadList">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="approved">已通过</el-radio-button>
        <el-radio-button value="finished">已完成</el-radio-button>
        <el-radio-button value="rejected">已驳回</el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="nickname" label="用户" width="110" />
      <el-table-column prop="user_phone" label="联系电话" width="130" />
      <el-table-column prop="appointment_time" label="预约时间" width="170" />
      <el-table-column label="方式" width="90">
        <template #default="{ row }">{{ row.mode === 'online' ? '线上' : '线下' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="地点/会议" width="160" show-overflow-tooltip />
      <el-table-column prop="subject" label="咨询主题" min-width="160" show-overflow-tooltip />
      <el-table-column prop="remark" label="诉求说明" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button link type="success" @click="change(row, 'approved')">通过</el-button>
            <el-button link type="danger" @click="change(row, 'rejected')">驳回</el-button>
          </template>
          <el-button
            v-if="row.status === 'approved'"
            link
            type="primary"
            @click="change(row, 'finished')"
          >
            标记完成
          </el-button>
          <span
            v-if="['finished', 'rejected', 'canceled'].includes(row.status)"
            style="color: #c0c4cc"
            >—</span
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const loading = ref(false)
const status = ref('')
const list = ref<any[]>([])

const statusText = (s: string) =>
  ({
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    finished: '已完成',
    canceled: '已取消',
  })[s] || s
const statusType = (s: string) =>
  ({
    pending: 'warning',
    approved: 'primary',
    rejected: 'danger',
    finished: 'success',
    canceled: 'info',
  })[s] || ''

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/appointments', { params: { status: status.value } })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

async function change(row: any, next: string) {
  let reviewRemark = ''
  try {
    const { value } = await ElMessageBox.prompt(
      next === 'rejected' ? '请填写驳回原因' : '可填写处理备注（可选）',
      statusText(next),
      { confirmButtonText: '确定', cancelButtonText: '取消', inputValue: '' },
    )
    reviewRemark = value || ''
  } catch {
    return
  }
  await request.put(`/appointments/${row.id}/status`, { status: next, reviewRemark })
  ElMessage.success('处理成功')
  loadList()
}

onMounted(() => {
  const qs = route.query.status
  if (qs && typeof qs === 'string') status.value = qs
  loadList()
})
</script>
