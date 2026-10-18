import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: () => {
      const user = JSON.parse(localStorage.getItem('mh_user') || 'null')
      return user?.role === 'admin' ? '/admin/dashboard' : '/counselor/dashboard'
    },
    children: [
      // ---------- 咨询师 ----------
      {
        path: 'counselor/dashboard',
        component: () => import('@/views/counselor/DashboardView.vue'),
        meta: { role: 'counselor', title: '工作台' },
      },
      {
        path: 'counselor/profiles',
        component: () => import('@/views/counselor/ProfilesView.vue'),
        meta: { role: 'counselor', title: '用户心理档案' },
      },
      {
        path: 'counselor/appointments',
        component: () => import('@/views/counselor/AppointmentsView.vue'),
        meta: { role: 'counselor', title: '预约管理' },
      },
      {
        path: 'counselor/consultations',
        component: () => import('@/views/counselor/ConsultationsView.vue'),
        meta: { role: 'counselor', title: '在线咨询' },
      },
      {
        path: 'counselor/articles',
        component: () => import('@/views/counselor/ArticlesView.vue'),
        meta: { role: 'counselor', title: '科普文章' },
      },
      // ---------- 管理员 ----------
      {
        path: 'admin/dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { role: 'admin', title: '数据总览' },
      },
      {
        path: 'admin/users',
        component: () => import('@/views/admin/UsersView.vue'),
        meta: { role: 'admin', title: '用户管理' },
      },
      {
        path: 'admin/counselors',
        component: () => import('@/views/admin/CounselorsView.vue'),
        meta: { role: 'admin', title: '咨询师账号' },
      },
      {
        path: 'admin/appointments',
        component: () => import('@/views/admin/AppointmentsView.vue'),
        meta: { role: 'admin', title: '预约审核' },
      },
      {
        path: 'admin/consultations',
        component: () => import('@/views/admin/ConsultationsView.vue'),
        meta: { role: 'admin', title: '在线咨询' },
      },
      {
        path: 'admin/assessments',
        component: () => import('@/views/admin/AssessmentsView.vue'),
        meta: { role: 'admin', title: '测评题库' },
      },
      {
        path: 'admin/articles',
        component: () => import('@/views/admin/ArticlesView.vue'),
        meta: { role: 'admin', title: '文章管理' },
      },
      {
        path: 'admin/announcements',
        component: () => import('@/views/admin/AnnouncementsView.vue'),
        meta: { role: 'admin', title: '公告管理' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('mh_token')
  const user = JSON.parse(localStorage.getItem('mh_user') || 'null')
  if (to.meta.public) return true
  if (!token) return '/login'
  if (to.meta.role && user?.role !== to.meta.role) {
    return user?.role === 'admin' ? '/admin/dashboard' : '/counselor/dashboard'
  }
  return true
})

export default router
