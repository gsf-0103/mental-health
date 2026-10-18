<template>
  <div>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索标题/分类" clearable style="width: 240px" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">查询</el-button>
      <div class="spacer" />
      <el-button type="primary" :icon="'Plus'" @click="openEdit()">发布文章</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="author_name" label="作者" width="100" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="views" label="浏览量" width="90" />
      <el-table-column prop="created_at" label="发布时间" width="170" />
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="form.id ? '编辑文章' : '发布文章'" width="720px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="form.category" style="width: 100%" allow-create filterable>
                <el-option label="情绪管理" value="情绪管理" />
                <el-option label="放松训练" value="放松训练" />
                <el-option label="人际关系" value="人际关系" />
                <el-option label="睡眠健康" value="睡眠健康" />
                <el-option label="青少年心理" value="青少年心理" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio value="published">发布</el-radio>
                <el-radio value="draft">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="正文">
          <el-input v-model="form.content" type="textarea" :rows="10" placeholder="支持纯文本排版" />
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
const keyword = ref('')
const list = ref<any[]>([])
const dialog = ref(false)
const form = reactive<any>({ id: null, title: '', category: '情绪管理', summary: '', content: '', status: 'published' })

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/articles', { params: { status: 'all', keyword: keyword.value } })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function openEdit(row?: any) {
  Object.assign(form, {
    id: row?.id || null,
    title: row?.title || '',
    category: row?.category || '情绪管理',
    summary: row?.summary || '',
    content: '',
    status: row?.status || 'published',
  })
  if (row) {
    request.get('/articles/' + row.id).then((res) => {
      form.content = res.data.content
    })
  }
  dialog.value = true
}

async function save() {
  if (!form.title || !form.content) {
    ElMessage.warning('标题和正文必填')
    return
  }
  if (form.id) {
    await request.put('/articles/' + form.id, form)
  } else {
    await request.post('/articles', form)
  }
  ElMessage.success('保存成功')
  dialog.value = false
  loadList()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确定删除文章「${row.title}」吗？`, '提示', { type: 'warning' })
  await request.delete('/articles/' + row.id)
  ElMessage.success('已删除')
  loadList()
}

onMounted(loadList)
</script>
