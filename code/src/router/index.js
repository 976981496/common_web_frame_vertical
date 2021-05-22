import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/orbbec/Dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true, noCache: true }
      }
    ]
  },
  {
    path: '/device', // 设备管理页面
    component: Layout,
    redirect: '/device/device_info',
    name: 'Device',
    alwaysShow: true,
    meta: {
      title: 'Device',
      icon: 'example'
    },
    children: [

      {
        path: 'device_info', // 设备信息页面
        component: () => import('@/views/orbbec/Device/device_info'),
        name: 'Device_Info',
        meta: {
          title: 'Device_Info',
          icon: 'international'
        }
      },
      {
        path: 'device_status', // 区域管理
        component: () => import('@/views/orbbec/Device/device_area'),
        name: 'Device_Status',
        meta: {
          title: 'Device_Status',
          icon: 'user'
        }
      }
    ]
  },
  {
    path: '/info', // lincence
    component: Layout,
    redirect: '/info/records',
    name: 'Licenses',
    children: [
      {
        path: 'records',
        component: () => import('@/views/orbbec/Licenses/index'),
        name: 'Records',
        meta: {
          title: 'Licenses',
          icon: 'form'
        }
      }
    ]
  },
  {
    path: '/person',
    component: Layout,
    redirect: '/person/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/orbbec/Dashboard/person'), // 个人信息
        name: 'Person',
        meta: { title: 'Person', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/psdUpdate',
    component: Layout,
    redirect: '/psdUpdate/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/orbbec/Dashboard/psdUpdate'), // 修改密码
        name: 'psdUpdate',
        meta: { title: 'psdUpdate', icon: 'user', noCache: true }
      }
    ]
  }
]
export const asyncRoutes = [
  {
    path: '/systemMag', // 系统管理页面
    component: Layout,
    redirect: '/systemMag/roleMag',
    name: 'SystemMag',
    meta: {
      title: 'SystemMag',
      icon: 'password'
    },
    children: [
      {
        path: 'roleMag', // 角色管理
        component: () => import('@/views/orbbec/SystemMag/roleMag'),
        name: 'RoleMag',
        meta: { title: 'RoleMag', icon: 'user' }
      },
      {
        path: 'userMag', // 用户管理
        component: () => import('@/views/orbbec/SystemMag/userMag'),
        name: 'UserMag',
        meta: {
          title: 'UserMag',
          icon: 'peoples'
        }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
// , roles: ['admin', 'super admin']
const createRouter = () => new Router({
  // mode: 'history', // require service support
  // scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
