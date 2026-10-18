<template>
  <div>
    <div class="toolbar">
      <el-radio-group v-model="status" @change="loadList">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="open">待回复</el-radio-button>
        <el-radio-button value="replied">已回复</el-radio-button>
        <el-radio-button value="closed">已结束</el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="nickname" label="用户" width="110" />
      <el-table-column prop="subject" label="咨询主题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="last_message" label="最新消息" min-width="220" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'open' ? 'danger' : row.status === 'replied' ? 'warning' : 'info'" size="small">
            {{ row.status === 'open' ? '待回复' : row.status === 'replied' ? '已回复' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评价" width="120">
        <template #default="{ row }">
          <el-rate v-if="row.rating" :model-value="row.rating" disabled size="small" />
          <span v-else style="color:#c0c4cc">未评价</span>
        </template>
      </el-table-column>
      <el-table-column prop="last_message_at" label="更新时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openChat(row)">回复</el-button>
          <el-button link type="success" @click="openRecord(row)">咨询记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 在线对话 -->
    <el-drawer v-model="chatVisible" size="46%" :title="current?.subject || '咨询对话'">
      <div class="chat-box" ref="chatBox">
        <div v-for="m in messages" :key="m.id" class="msg-row" :class="m.sender_type === 'counselor' ? 'me' : 'user'">
          <div class="bubble">{{ m.content }}</div>
        </div>
      </div>
      <div class="chat-input">
        <el-input v-model="replyText" type="textarea" :rows="2" placeholder="输入回复内容…" @keyup.enter.ctrl="send" />
        <el-button type="primary" @click="send">发送</el-button>
      </div>
    </el-drawer>

    <!-- 咨询过程/结果记录 -->
    <el-dialog v-model="recordVisible" title="咨询过程与结果记录" width="640px">
      <el-form :model="recordForm" label-width="90px">
        <el-form-item label="咨询过程">
          <el-input v-model="recordForm.processNote" type="textarea" :rows="3" placeholder="记录咨询中使用的方法与关键过程" />
        </el-form-item>
        <el-form-item label="初步评估">
          <el-input v-model="recordForm.diagnosis" placeholder="如：一般心理问题 / 焦虑情绪反应" />
        </el-form-item>
        <el-form-item label="咨询结果">
          <el-input v-model="recordForm.result" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="后续建议">
          <el-input v-model="recordForm.suggestion" type="textarea" :rows="2" placeholder="家庭作业、复诊安排等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">保存归档</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const status = ref('')
const list = ref<any[]>([])

const chatVisible = ref(false)
const current = ref<any>(null)
const messages = ref<any[]>([])
const replyText = ref('')
const chatBox = ref<HTMLElement>()

const recordVisible = ref(false)
const recordForm = reactive<any>({ processNote: '', diagnosis: '', result: '', suggestion: '' })

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/consultations', { params: { status: status.value } })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

async function openChat(row: any) {
  current.value = row
  chatVisible.value = true
  const res = await request.get('/consultations/' + row.id)
  messages.value = res.data.messages
  await nextTick()
  scrollBottom()
}

function scrollBottom() {
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
}

async function send() {
  if (!replyText.value.trim()) return
  await request.post(`/consultations/${current.value.id}/messages`, { content: replyText.value })
  replyText.value = ''
  await openChat(current.value)
  loadList()
}

async function openRecord(row: any) {
  current.value = row
  const res = await request.get('/consultations/' + row.id)
  const r = res.data.record || {}
  Object.assign(recordForm, {
    processNote: r.process_note || '',
    diagnosis: r.diagnosis || '',
    result: r.result || '',
    suggestion: r.suggestion || '',
  })
  recordVisible.value = true
}

async function saveRecord() {
  await request.post(`/consultations/${current.value.id}/record`, recordForm)
  ElMessage.success('咨询记录已保存')
  recordVisible.value = false
}

onMounted(loadList)
</script>

<style scoped>
.chat-box {
  height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}
.msg-row {
  display: flex;
  margin-bottom: 12px;
}
.msg-row.me {
  justify-content: flex-end;
}
.bubble {
  max-width: 75%;
  padding: 9px 13px;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.msg-row.me .bubble {
  background: #ecf5ff;
}
.chat-input {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}
</style>
