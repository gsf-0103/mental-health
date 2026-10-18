<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="c in cards" :key="c.label">
        <el-card shadow="hover" class="clickable" style="margin-bottom: 16px" @click="go(c)">
          <div class="stat">
            <el-icon :size="32" :color="c.color"><component :is="c.icon" /></el-icon>
            <div>
              <div class="num" :style="{ color: c.color }">{{ c.value }}</div>
              <div class="label">{{ c.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>近6个月新增用户</template>
          <div class="chart">
            <div v-for="m in stats.monthlyUsers" :key="m.month" class="bar-item">
              <div class="bar" :style="{ height: barHeight(m.count) + 'px' }">{{ m.count }}</div>
              <div class="bar-label">{{ m.month.slice(5) }}</div>
            </div>
            <el-empty v-if="!stats.monthlyUsers?.length" description="暂无数据" :image-size="80" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header
            >用户风险等级分布<el-text type="info" size="small" style="margin-left: 8px"
              >点击跳转用户管理</el-text
            ></template
          >
          <div class="risk-list">
            <div
              v-for="r in riskRows"
              :key="r.level"
              class="risk-row clickable"
              @click="goRisk(r.level)"
            >
              <span class="risk-name">
                <el-tag :type="riskType(r.level)" size="small">{{ riskText(r.level) }}</el-tag>
              </span>
              <el-progress
                :percentage="riskPercent(r.count)"
                :color="riskColor(r.level)"
                style="flex: 1; margin: 0 14px"
              />
              <span class="risk-count">{{ r.count }} 人</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()

const stats = reactive<any>({ monthlyUsers: [], risk: [] })

const cards = computed(() => [
  {
    label: '注册用户',
    value: stats.userTotal,
    icon: 'User',
    color: '#409eff',
    path: '/admin/users',
  },
  {
    label: '近30天新增',
    value: stats.newUser30,
    icon: 'Plus',
    color: '#67c23a',
    path: '/admin/users',
  },
  {
    label: '在岗咨询师',
    value: stats.counselorTotal,
    icon: 'Avatar',
    color: '#e6a23c',
    path: '/admin/counselors',
  },
  {
    label: '累计预约',
    value: stats.appointmentTotal,
    icon: 'Calendar',
    color: '#909399',
    path: '/admin/appointments',
  },
  {
    label: '待审核预约',
    value: stats.appointmentPending,
    icon: 'Clock',
    color: '#f56c6c',
    path: '/admin/appointments',
    query: { status: 'pending' },
  },
  {
    label: '已完成预约',
    value: stats.appointmentFinished,
    icon: 'CircleCheck',
    color: '#67c23a',
    path: '/admin/appointments',
    query: { status: 'finished' },
  },
  {
    label: '在线咨询总数',
    value: stats.consultationTotal,
    icon: 'ChatDotRound',
    color: '#409eff',
    path: '/admin/consultations',
  },
  {
    label: '测评完成次数',
    value: stats.recordTotal,
    icon: 'EditPen',
    color: '#9b59b6',
    path: '/admin/assessments',
  },
])

function go(c: any) {
  if (!c.path) return
  router.push({ path: c.path, query: c.query || {} })
}

function goRisk(level: string) {
  router.push({ path: '/admin/users', query: { risk: level } })
}

const riskRows = computed(() => {
  const map: Record<string, number> = { low: 0, medium: 0, high: 0 }
  ;(stats.risk || []).forEach((r: any) => (map[r.risk_level] = r.count))
  return [
    { level: 'low', count: map.low },
    { level: 'medium', count: map.medium },
    { level: 'high', count: map.high },
  ]
})
const riskTotal = computed(() => riskRows.value.reduce((s, r) => s + Number(r.count), 0) || 1)
const riskPercent = (n?: number) => Math.round((Number(n) / riskTotal.value) * 100)
const riskText = (l: string) => ({ low: '低风险', medium: '中风险', high: '高风险' })[l] || l
const riskType = (l: string) => (l === 'high' ? 'danger' : l === 'medium' ? 'warning' : 'success')
const riskColor = (l: string) => (l === 'high' ? '#f56c6c' : l === 'medium' ? '#e6a23c' : '#67c23a')

const maxCount = computed(() =>
  Math.max(1, ...(stats.monthlyUsers || []).map((m: any) => Number(m.count))),
)
function barHeight(count: number) {
  return Math.round((Number(count) / maxCount.value) * 180) + 20
}

onMounted(async () => {
  const res = await request.get('/stats/admin')
  Object.assign(stats, res.data)
})
</script>

<style scoped>
.clickable {
  cursor: pointer;
  transition: transform 0.15s;
}
.clickable:hover {
  transform: translateY(-2px);
}
.stat {
  display: flex;
  align-items: center;
  gap: 14px;
}
.num {
  font-size: 26px;
  font-weight: 700;
}
.label {
  color: #909399;
  font-size: 13px;
}
.chart {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  height: 240px;
  padding: 10px 20px;
}
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bar {
  width: 42px;
  min-height: 20px;
  background: linear-gradient(180deg, #95d475, #67c23a);
  border-radius: 4px 4px 0 0;
  color: #fff;
  text-align: center;
  font-size: 12px;
  line-height: 20px;
}
.bar-label {
  font-size: 12px;
  color: #909399;
}
.risk-list {
  padding: 20px 10px;
}
.risk-row {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}
.risk-name {
  width: 80px;
}
.risk-count {
  width: 60px;
  text-align: right;
  font-weight: 600;
}
</style>
