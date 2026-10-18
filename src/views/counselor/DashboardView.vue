<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="clickable" @click="go(card)">
          <div class="stat">
            <el-icon :size="34" :color="card.color"><component :is="card.icon" /></el-icon>
            <div>
              <div class="num" :style="{ color: card.color }">{{ card.value }}</div>
              <div class="label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card>
          <template #header>近6个月咨询量趋势</template>
          <div class="chart">
            <div v-for="m in stats.monthly" :key="m.month" class="bar-item">
              <div class="bar" :style="{ height: barHeight(m.count) + 'px' }">{{ m.count }}</div>
              <div class="bar-label">{{ m.month.slice(5) }}</div>
            </div>
            <el-empty v-if="!stats.monthly?.length" description="暂无数据" :image-size="80" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>最新用户反馈</span>
              <el-rate
                :model-value="avgRatingNum"
                disabled
                show-score
                score-template="均分 {value}"
              />
            </div>
          </template>
          <el-table :data="stats.feedbacks" size="small" max-height="280">
            <el-table-column prop="nickname" label="用户" width="80" />
            <el-table-column prop="subject" label="咨询主题" show-overflow-tooltip />
            <el-table-column label="评分" width="120">
              <template #default="{ row }">
                <el-rate :model-value="row.rating" disabled size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="feedback" label="反馈内容" show-overflow-tooltip />
          </el-table>
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

const stats = reactive<any>({
  monthly: [],
  feedbacks: [],
  avgRating: '暂无',
})

const cards = computed(() => [
  {
    label: '总预约次数',
    value: stats.appointmentTotal,
    icon: 'Calendar',
    color: '#409eff',
    path: '/counselor/appointments',
  },
  {
    label: '已完成咨询',
    value: stats.appointmentFinished,
    icon: 'CircleCheck',
    color: '#67c23a',
    path: '/counselor/appointments',
    query: { status: 'finished' },
  },
  {
    label: '待处理预约',
    value: stats.appointmentPending,
    icon: 'Clock',
    color: '#e6a23c',
    path: '/counselor/appointments',
    query: { status: 'pending' },
  },
  {
    label: '在线会话数',
    value: stats.consultationTotal,
    icon: 'ChatDotRound',
    color: '#909399',
    path: '/counselor/consultations',
  },
])

function go(card: any) {
  if (!card.path) return
  router.push({ path: card.path, query: card.query || {} })
}

const avgRatingNum = computed(() => Number(stats.avgRating) || 0)
const maxCount = computed(() =>
  Math.max(1, ...(stats.monthly || []).map((m: any) => Number(m.count))),
)
function barHeight(count: number) {
  return Math.round((Number(count) / maxCount.value) * 180) + 20
}

onMounted(async () => {
  const res = await request.get('/stats/counselor')
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
  gap: 16px;
}
.num {
  font-size: 28px;
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
  background: linear-gradient(180deg, #79bbff, #409eff);
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
</style>
