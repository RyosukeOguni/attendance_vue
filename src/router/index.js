import Vue from 'vue'
import VueRouter from 'vue-router'
import Stamp from '../views/Stamp.vue'
import Attendance from '../views/Attendance.vue'
import Output from '../views/Output.vue'
import User from '../views/User.vue'
import Auth from '@/store/auth.js'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/stamp/1',
    component: Stamp,
    children: [
      {
        path: '/stamp/:id(1|2)',
        name: 'Stamp',
        component: Stamp,
      },
    ],
  },

  // {
  //   path: '/',
  //   name: 'Stamp',
  //   component: Stamp,
  // },
  // {
  //   path: '/stamp/:id(1|2)',
  //   name: 'Stamp',
  //   component: Stamp,
  // },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance,
    meta: { requiresAuth: true },
  },
  {
    path: '/output',
    name: 'Output',
    component: Output,
    meta: { requiresAuth: true },
  },
  {
    path: '/user',
    name: 'User',
    component: User,
    meta: { requiresAuth: true },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth) && !Auth.state.isAuth) {
    next({ path: '/stamp/1' })
  } else {
    next()
  }
})

export default router
