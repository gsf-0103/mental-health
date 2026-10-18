import { defineStore } from 'pinia'
import request from '@/utils/request'

export interface WebUser {
  id: number
  username: string
  realName: string
  role: 'admin' | 'counselor'
  avatar?: string
  title?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('mh_token') || '',
    user: JSON.parse(localStorage.getItem('mh_user') || 'null') as WebUser | null,
  }),
  getters: {
    isLogin: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isCounselor: (state) => state.user?.role === 'counselor',
  },
  actions: {
    async login(username: string, password: string) {
      const res = await request.post('/auth/login', { username, password })
      this.token = res.data.token
      this.user = res.data.user
      localStorage.setItem('mh_token', this.token)
      localStorage.setItem('mh_user', JSON.stringify(this.user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('mh_token')
      localStorage.removeItem('mh_user')
    },
  },
})
