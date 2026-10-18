<template>
  <div>
    <div class="toolbar">
      <span class="section-title" style="margin:0">系统公告管理</span>
      <div class="spacer" />
      <el-button type="primary" :icon="'Plus'" @click="openEdit()">发布公告</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '已发布' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="发布时间" width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggle(row)">
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="form.id ? '编辑公告' : '发布公告'" width="560px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.statusBool">
            <el-radio :value="true">立即发布</el-radio>
            <el-radio :value="false">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
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
const form = reactive<any>({ id: null, title: '', content: '', statusBool: true })

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/announcements', { params: { status: 'all' } })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function openEdit(row?: any) {
  Object.assign(form, {
    id: row?.id || null,
    title: row?.title || '',
    content: row?.content || '',
    statusBool: row ? row.status === 1 : true,
  })
  dialog.value = true
}

async function save() {
  if (!form.title) {
    ElMessage.warning('请输入标题')
    return
  }
  const payload = { title: form.title, content: form.content, status: form.statusBool ? 1 : 0 }
  if (form.id) await request.put('/announcements/' + form.id, payload)
  else await request.post('/announcements', payload)
  ElMessage.success('保存成功')
  dialog.value = false
  loadList()
}

async function toggle(row: any) {
  await request.put('/announcements/' + row.id, {
    title: row.title,
    content: row.content,
    status: row.status === 1 ? 0 : 1,
  })
  loadList()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确定删除公告「${row.title}」吗？`, '提示', { type: 'warning' })
  await request.delete('/announcements/' + row.id)
  ElMessage.success('已删除')
  loadList()
}

onMounted(loadList)
</script>
