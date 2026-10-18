<template>
  <div>
    <div class="toolbar">
      <span class="section-title" style="margin: 0">心理测评题库（量表 / 题目 / 评分规则）</span>
      <div class="spacer" />
      <el-button type="primary" :icon="'Plus'" @click="openEdit()">新建量表</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="name" label="量表名称" min-width="200" />
      <el-table-column prop="code" label="编码" width="100" />
      <el-table-column prop="question_count" label="题目数" width="90" />
      <el-table-column prop="duration_min" label="预计用时(分)" width="110" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" @change="(v: boolean) => toggle(row, v)" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="form.id ? '编辑量表' : '新建量表'" width="860px" top="5vh">
      <el-form :model="form" label-width="90px">
        <el-row :gutter="12">
          <el-col :span="10">
            <el-form-item label="量表名称"><el-input v-model="form.name" /></el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="编码"
              ><el-input v-model="form.code" :disabled="!!form.id"
            /></el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="用时(分)"
              ><el-input-number v-model="form.durationMin" :min="1" :max="120"
            /></el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="启用">
              <el-switch v-model="form.statusBool" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="量表说明"
          ><el-input v-model="form.description" type="textarea" :rows="2"
        /></el-form-item>
        <el-form-item label="答题指导"
          ><el-input v-model="form.instruction" type="textarea" :rows="2"
        /></el-form-item>
      </el-form>

      <el-divider content-position="left">评分规则（按总分区间判定结果）</el-divider>
      <div v-for="(lv, i) in form.levels" :key="i" class="level-row">
        <el-input-number
          v-model="lv.min"
          :min="0"
          controls-position="right"
          style="width: 110px"
          placeholder="最低分"
        />
        <span>~</span>
        <el-input-number
          v-model="lv.max"
          :min="0"
          controls-position="right"
          style="width: 110px"
          placeholder="最高分"
        />
        <el-input v-model="lv.label" placeholder="等级，如：轻度焦虑" style="width: 170px" />
        <el-input v-model="lv.advice" placeholder="该等级的指导建议" />
        <el-button link type="danger" @click="form.levels.splice(i, 1)">删除</el-button>
      </div>
      <el-button size="small" @click="form.levels.push({ min: 0, max: 0, label: '', advice: '' })"
        >+ 添加评分区间</el-button
      >

      <el-divider content-position="left">测试题目</el-divider>
      <div v-for="(q, qi) in form.questions" :key="qi" class="q-block">
        <div class="q-head">
          <span>第 {{ Number(qi) + 1 }} 题</span>
          <el-button link type="danger" @click="form.questions.splice(Number(qi), 1)"
            >移除</el-button
          >
        </div>
        <el-input v-model="q.content" placeholder="题干内容" />
        <div class="opt-row" v-for="(o, oi) in q.options" :key="oi">
          <el-tag size="small" style="width: 44px; text-align: center">{{ o.key }}</el-tag>
          <el-input v-model="o.text" placeholder="选项文字" />
          <el-input-number
            v-model="o.score"
            :min="0"
            :max="10"
            controls-position="right"
            style="width: 120px"
          />
          <span style="color: #909399; font-size: 12px">分</span>
        </div>
      </div>
      <el-button size="small" @click="addQuestion">+ 添加题目（默认4个选项）</el-button>

      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存量表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const list = ref<any[]>([])
const dialog = ref(false)

const defaultOptions = () => [
  { key: 'A', text: '完全不会', score: 0 },
  { key: 'B', text: '有几天', score: 1 },
  { key: 'C', text: '一半以上天数', score: 2 },
  { key: 'D', text: '几乎每天', score: 3 },
]

const form = reactive<any>({
  id: null,
  name: '',
  code: '',
  description: '',
  instruction: '',
  durationMin: 5,
  statusBool: true,
  levels: [],
  questions: [],
})

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/assessments', { params: { all: 1 } })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    id: null,
    name: '',
    code: '',
    description: '',
    instruction: '',
    durationMin: 5,
    statusBool: true,
    levels: [{ min: 0, max: 4, label: '', advice: '' }],
    questions: [],
  })
}

function addQuestion() {
  form.questions.push({
    content: '',
    dimension: '',
    options: defaultOptions().map((o) => ({ ...o })),
  })
}

async function openEdit(row?: any) {
  resetForm()
  if (row) {
    const res = await request.get('/assessments/' + row.id)
    const a = res.data.assessment
    form.id = a.id
    form.name = a.name
    form.code = a.code
    form.description = a.description
    form.instruction = a.instruction
    form.durationMin = a.duration_min
    form.statusBool = a.status === 1
    form.levels = typeof a.levels === 'string' ? JSON.parse(a.levels) : a.levels || []
    form.questions = res.data.questions.map((q: any) => ({
      content: q.content,
      dimension: q.dimension,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }))
  }
  dialog.value = true
}

async function save() {
  if (!form.name || !form.code || !form.questions.length) {
    ElMessage.warning('名称、编码和至少一道题目为必填')
    return
  }
  const payload = {
    name: form.name,
    code: form.code,
    description: form.description,
    instruction: form.instruction,
    levels: form.levels,
    durationMin: form.durationMin,
    status: form.statusBool ? 1 : 0,
    questions: form.questions,
  }
  if (form.id) {
    await request.put('/assessments/' + form.id, payload)
  } else {
    await request.post('/assessments', payload)
  }
  ElMessage.success('量表已保存')
  dialog.value = false
  loadList()
}

async function toggle(row: any, val: boolean) {
  await request.put(`/assessments/${row.id}/status`, { status: val ? 1 : 0 })
  ElMessage.success('状态已更新')
  loadList()
}

async function remove(row: any) {
  await ElMessageBox.confirm(
    `确定删除量表「${row.name}」及其全部题目吗？历史测评记录会保留。`,
    '危险操作',
    {
      type: 'warning',
    },
  )
  await request.delete('/assessments/' + row.id)
  ElMessage.success('已删除')
  loadList()
}

onMounted(loadList)
</script>

<style scoped>
.level-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.q-block {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  background: #fafafa;
}
.q-head {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
}
.opt-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
</style>
