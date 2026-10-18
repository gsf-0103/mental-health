<template>
  <div>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索昵称/姓名/手机号" clearable style="width: 260px" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">查询</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column label="用户" min-width="160">
        <template #default="{ row }">
          <el-avatar :size="32" :src="row.avatar">{{ (row.real_name || row.nickname || '?').charAt(0) }}</el-avatar>
          <span style="margin-left: 8px">{{ row.real_name || row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="occupation" label="职业" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column label="风险等级" width="110">
        <template #default="{ row }">
          <el-tag :type="riskType(row.risk_level)" size="small">{{ riskText(row.risk_level) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最近测评" width="180">
        <template #default="{ row }">
          <span v-if="row.last_test_time">{{ row.last_test_level }} · {{ row.last_test_time?.slice(0, 10) }}</span>
          <span v-else style="color:#c0c4cc">未测评</span>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">档案详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 档案详情抽屉 -->
    <el-drawer v-model="drawer" size="60%" :title="detail?.user.nickname + ' 的心理健康档案'">
      <template v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="姓名">{{ detail.profile?.real_name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职业">{{ detail.profile?.occupation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.user.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">
            {{ detail.profile?.emergency_contact || '-' }} {{ detail.profile?.emergency_phone || '' }}
          </el-descriptions-item>
          <el-descriptions-item label="既往病史" :span="2">{{ detail.profile?.medical_history || '-' }}</el-descriptions-item>
          <el-descriptions-item label="家族病史" :span="2">{{ detail.profile?.family_history || '-' }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="riskType(detail.profile?.risk_level)" size="small">
              {{ riskText(detail.profile?.risk_level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标签">{{ detail.profile?.tags || '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询师备注" :span="2">{{ detail.profile?.notes || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-tabs style="margin-top: 12px">
          <el-tab-pane label="心理测评结果">
            <el-table :data="detail.records" size="small" border>
              <el-table-column prop="assessment_name" label="量表" />
              <el-table-column prop="score" label="得分" width="80" />
              <el-table-column prop="level_label" label="结果" width="140" />
              <el-table-column prop="advice" label="建议" show-overflow-tooltip />
              <el-table-column prop="created_at" label="测评时间" width="160" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="历史预约">
            <el-table :data="detail.appointments" size="small" border>
              <el-table-column prop="appointment_time" label="预约时间" width="160" />
              <el-table-column prop="counselor_name" label="咨询师" width="90" />
              <el-table-column prop="subject" label="主题" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="90">
                <template #default="{ row }">
                  <el-tag size="small">{{ apStatus(row.status) }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="历史咨询">
            <el-table :data="detail.consultations" size="small" border>
              <el-table-column prop="counselor_name" label="咨询师" width="90" />
              <el-table-column prop="subject" label="主题" show-overflow-tooltip />
              <el-table-column label="评分" width="100">
                <template #default="{ row }">
                  <el-rate v-if="row.rating" :model-value="row.rating" disabled size="small" />
                  <span v-else style="color:#c0c4cc">未评价</span>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="发起时间" width="160" />
            </el-table>
          </el-tab-pane>
        </el-tabs>

        <div style="margin-top: 16px; text-align: right">
          <el-button type="primary" @click="openEdit">编辑档案 / 随访备注</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 编辑档案 -->
    <el-dialog v-model="editVisible" title="编辑心理健康档案" width="640px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职业"><el-input v-model="form.occupation" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系人"><el-input v-model="form.emergencyContact" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话"><el-input v-model="form.emergencyPhone" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="既往病史"><el-input v-model="form.medicalHistory" type="textarea" :rows="2" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="家族病史"><el-input v-model="form.familyHistory" type="textarea" :rows="2" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="风险等级">
              <el-select v-model="form.riskLevel" style="width: 100%">
                <el-option label="低风险" value="low" />
                <el-option label="中风险" value="medium" />
                <el-option label="高风险" value="high" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签"><el-input v-model="form.tags" placeholder="如：焦虑,失眠" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="随访备注"><el-input v-model="form.notes" type="textarea" :rows="3" /></el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const keyword = ref('')
const list = ref<any[]>([])
const drawer = ref(false)
const detail = ref<any>(null)
const editVisible = ref(false)
const form = reactive<any>({})

const riskMap: Record<string, string> = { low: '低风险', medium: '中风险', high: '高风险' }
const riskType = (r: string) => (r === 'high' ? 'danger' : r === 'medium' ? 'warning' : 'success')
const riskText = (r: string) => riskMap[r || 'low']
const apStatus = (s: string) =>
  ({ pending: '待审核', approved: '已通过', rejected: '已驳回', finished: '已完成', canceled: '已取消' }[s] || s)

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/users', { params: { keyword: keyword.value } })
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

function openEdit() {
  const p = detail.value.profile || {}
  Object.assign(form, {
    realName: p.real_name, occupation: p.occupation,
    emergencyContact: p.emergency_contact, emergencyPhone: p.emergency_phone,
    medicalHistory: p.medical_history, familyHistory: p.family_history,
    riskLevel: p.risk_level || 'low', tags: p.tags, notes: p.notes,
  })
  editVisible.value = true
}

async function saveProfile() {
  await request.put(`/users/${detail.value.user.id}/profile`, form)
  ElMessage.success('档案已更新')
  editVisible.value = false
  openDetail({ id: detail.value.user.id })
  loadList()
}

onMounted(loadList)
</script>
