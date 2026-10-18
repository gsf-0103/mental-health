<template>
  <div>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索姓名/账号/手机号" clearable style="width: 260px" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">查询</el-button>
      <div class="spacer" />
      <el-button type="primary" :icon="'Plus'" @click="openAdd">新增咨询师账号</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="登录账号" width="130" />
      <el-table-column prop="real_name" label="姓名" width="100" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="title" label="职称" width="150" />
      <el-table-column prop="intro" label="擅长方向" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 1"
            @change="(v: boolean) => toggleStatus(row, v)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="openReset(row)">重置密码</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="form.id ? '编辑咨询师' : '新增咨询师账号'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="登录账号" v-if="!form.id">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="初始密码" v-if="!form.id">
          <el-input v-model="form.password" placeholder="请输入初始密码" show-password />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="职称">
          <el-input v-model="form.title" placeholder="如：国家二级心理咨询师" />
        </el-form-item>
        <el-form-item label="擅长方向">
          <el-input v-model="form.intro" type="textarea" :rows="3" />
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
const form = reactive<any>({ id: null, username: '', password: '', realName: '', phone: '', title: '', intro: '' })

async function loadList() {
  loading.value = true
  try {
    const res = await request.get('/counselors/admin/list', { params: { keyword: keyword.value } })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function openAdd() {
  Object.assign(form, { id: null, username: '', password: '', realName: '', phone: '', title: '', intro: '' })
  dialog.value = true
}

function openEdit(row: any) {
  Object.assign(form, {
    id: row.id, username: row.username, password: '',
    realName: row.real_name, phone: row.phone, title: row.title, intro: row.intro,
  })
  dialog.value = true
}

async function save() {
  if (!form.realName || (!form.id && (!form.username || !form.password))) {
    ElMessage.warning('请完整填写账号、密码和姓名')
    return
  }
  if (form.id) {
    await request.put('/counselors/' + form.id, form)
  } else {
    await request.post('/counselors', form)
  }
  ElMessage.success('保存成功')
  dialog.value = false
  loadList()
}

async function toggleStatus(row: any, val: boolean) {
  await request.put('/counselors/' + row.id, {
    realName: row.real_name,
    phone: row.phone,
    title: row.title,
    intro: row.intro,
    status: val ? 1 : 0,
  })
  ElMessage.success(val ? '账号已启用' : '账号已停用')
  loadList()
}

async function openReset(row: any) {
  const { value } = await ElMessageBox.prompt(`为「${row.real_name}」设置新密码`, '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
  })
  if (!value) return ElMessage.warning('密码不能为空')
  await request.put(`/counselors/${row.id}/password`, { password: value })
  ElMessage.success('密码已重置')
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确定删除咨询师「${row.real_name}」的账号吗？`, '危险操作', { type: 'warning' })
  await request.delete('/counselors/' + row.id)
  ElMessage.success('已删除')
  loadList()
}

onMounted(loadList)
</script>
