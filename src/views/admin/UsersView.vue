<template>
  <div>
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索昵称/姓名/手机号"
        clearable
        style="width: 260px"
        @keyup.enter="loadList"
      />
      <el-select
        v-model="risk"
        placeholder="风险等级"
        clearable
        style="width: 140px"
        @change="loadList"
      >
        <el-option label="低风险" value="low" />
        <el-option label="中风险" value="medium" />
        <el-option label="高风险" value="high" />
      </el-select>
      <el-button type="primary" @click="loadList">查询</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="用户" min-width="150">
        <template #default="{ row }">
          <el-avatar :size="30" :src="row.avatar">{{
            (row.real_name || row.nickname || '?').charAt(0)
          }}</el-avatar>
          <span style="margin-left: 8px">{{ row.real_name || row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column label="性别" width="80">
        <template #default="{ row }">{{
          row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知'
        }}</template>
      </el-table-column>
      <el-table-column label="风险等级" width="100">
        <template #default="{ row }">
          <el-tag :type="riskType(row.risk_level)" size="small">{{
            riskText(row.risk_level)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最近测评" width="190">
        <template #default="{ row }">
          <span v-if="row.last_test_time"
            >{{ row.last_test_level }} · {{ row.last_test_time?.slice(0, 16) }}</span
          >
          <span v-else style="color: #c0c4cc">未测评</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="170" />
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">查看档案</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawer" size="58%" :title="detail?.user.nickname + ' 的完整档案'">
      <template v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="昵称">{{ detail.user.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.user.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="openid">{{ detail.user.openid }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ detail.user.created_at }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{
            detail.profile?.real_name || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="职业">{{
            detail.profile?.occupation || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">
            {{ detail.profile?.emergency_contact || '-' }}
            {{ detail.profile?.emergency_phone || '' }}
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="riskType(detail.profile?.risk_level)" size="small">
              {{ riskText(detail.profile?.risk_level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="既往病史" :span="2">{{
            detail.profile?.medical_history || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="家族病史" :span="2">{{
            detail.profile?.family_history || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="标签">{{
            detail.profile?.tags || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="咨询师备注" :span="2">{{
            detail.profile?.notes || '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <el-tabs style="margin-top: 12px">
          <el-tab-pane :label="`测评结果(${detail.records.length})`">
            <el-table :data="detail.records" size="small" border>
              <el-table-column prop="assessment_name" label="量表" />
              <el-table-column prop="score" label="得分" width="70" />
              <el-table-column prop="level_label" label="结果" width="130" />
              <el-table-column prop="created_at" label="时间" width="160" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane :label="`预约记录(${detail.appointments.length})`">
            <el-table :data="detail.appointments" size="small" border>
              <el-table-column prop="appointment_time" label="时间" width="160" />
              <el-table-column prop="counselor_name" label="咨询师" width="90" />
              <el-table-column prop="subject" label="主题" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="90" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane :label="`咨询记录(${detail.consultations.length})`">
            <el-table :data="detail.consultations" size="small" border>
              <el-table-column prop="counselor_name" label="咨询师" width="90" />
              <el-table-column prop="subject" label="主题" show-overflow-tooltip />
              <el-table-column prop="rating" label="评分" width="70" />
              <el-table-column prop="created_at" label="时间" width="160" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const loading = ref(false)
const keyword = ref('')
const risk = ref('')
const list = ref<any[]>([])
const drawer = ref(false)
const detail = ref<any>(null)

const riskMap: Record<string, string> = { low: '低风险', medium: '中风险', high: '高风险' }
const riskType = (r: string) => (r === 'high' ? 'danger' : r === 'medium' ? 'warning' : 'success')
const riskText = (r: string) => riskMap[r || 'low']

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/users', {
      params: { keyword: keyword.value, risk: risk.value },
    })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

async function openDetail(row: any) {
  const res = await request.get('/users/' + row.id)
  detail.value = res.data
  drawer.value = true
}

onMounted(() => {
  const qr = route.query.risk
  if (qr && typeof qr === 'string') risk.value = qr
  loadList()
})
</script>
