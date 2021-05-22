import {
  login,
  getInfo,
  updatePsd
} from '@/api/dashboard'
import {
  getToken,
  setToken,
  removeToken,
  getUser_id,
  setUser_id,
  removeUser_id
} from '@/utils/auth'
import router, {
  resetRouter
} from '@/router'
import sha1 from 'js-sha1'

const state = {
  token: getToken(),
  control: '', // 控制权限
  update: '', // 编辑权限
  read: '', // 浏览权限
  authDelete: '', // 删除权限

  monitor: '', // 监控统计
  task: '', // 任务给管理
  container: '', // 容器管理
  host: '', // 主机管理
  system: '', // 系统权限

  user_id: getUser_id(), // 当前用户id
  name: '',
  role_id: '',
  gender: '',
  email: '',
  group: '',
  role_name: '',
  store: '',
  avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  roles: [],
  is_key_customer: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },

  // 监控统计
  SET_MONITOR: (state, monitor) => {
    state.monitor = monitor
  },
  // 任务给管理
  SET_TASK: (state, task) => {
    state.task = task
  },
  // 容器管理
  SET_CONTAINER: (state, container) => {
    state.container = container
  },
  // 主机管理
  SET_HOST: (state, host) => {
    state.host = host
  },
  // 系统权限
  SET_SYSTEM: (state, system) => {
    state.system = system
  },
  SET_CONTROL: (state, control) => {
    state.control = control
  },
  SET_UPDATA: (state, update) => {
    state.update = update
  },
  SET_READ: (state, read) => {
    state.read = read
  },
  SET_AUTHDELETE: (state, authDelete) => {
    state.authDelete = authDelete
  },
  SET_USER_ID: (state, user_id) => {
    state.user_id = user_id
  },
  SET_ROLE_ID: (state, role_id) => {
    state.role_id = role_id
  },
  SET_STORE: (state, store) => {
    state.store = store
  },
  SET_GENDER: (state, gender) => {
    state.gender = gender
  },
  SET_GROUP: (state, group) => {
    state.group = group
  },
  SET_ROLE_NAME: (state, role_name) => {
    state.role_name = role_name
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ISKEYCUSTOMER: (state, is_key_customer) => {
    state.is_key_customer = is_key_customer
  }
}

const actions = {
  modifyAuth({
    commit
  }, modifyAuth) {
    return new Promise((resolve, reject) => {
      console.log('user----------/modifyAuth', modifyAuth)
      commit('SET_ROLE_NAME', modifyAuth.role_name)
      commit('SET_ROLE_ID', modifyAuth.role_id)
      commit('SET_CONTROL', modifyAuth.control)
      commit('SET_UPDATA', modifyAuth.update)
      commit('SET_READ', modifyAuth.read)
      commit('SET_AUTHDELETE', modifyAuth.delete)

      // 监控统计
      commit('SET_MONITOR', modifyAuth.monitor)
      // 任务给管理
      commit('SET_TASK', modifyAuth.task)
      // 容器管理
      commit('SET_CONTAINER', modifyAuth.container)
      // 主机管理
      commit('SET_HOST', modifyAuth.host)
      // 系统权限
      commit('SET_SYSTEM', modifyAuth.system)
    })
  },
  // user login
  login({
    commit
  }, userInfo) {
    const {
      email,
      passwd
    } = userInfo
    return new Promise((resolve, reject) => {
      login({
        email: email.trim(),
        passwd: sha1('orbbec_tool_integration_' + passwd)
      }).then(response => {
        const data = response
        commit('SET_TOKEN', data.token)
        commit('SET_USER_ID', data.user_id)
        commit('SET_ROLE_ID', data.role_id)
        setToken(data.token)
        setUser_id(data.user_id)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  psdUpdate({
    commit
  }, userInfo) {
    // const { email, passwd } = userInfo
    return new Promise((resolve, reject) => {
      updatePsd(userInfo).then(response => {
        // const data = response
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      getInfo(state.user_id).then(response => {
        const data = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const d = data
        const {
          email,
          group,
          gender,
          name,
          role_name,
          role_id,
          is_key_customer
        } = d
        // roles must be a non-empty array
        var role = []

        let authNum
        try {
          authNum = data.modules[0].op
        } catch (error) {
          authNum = 32
        }
        const read = (authNum & 0x02) !== 0 ? true : false
        const update = (authNum & 0x04) !== 0 ? true : false
        const authDelete = (authNum & 0x08) !== 0 ? true : false
        const control = (authNum & 0x10) !== 0 ? true : false

        const monitor = (authNum & 0x20) !== 0 ? true : false
        const task = (authNum & 0x40) !== 0 ? true : false
        const container = (authNum & 0x80) !== 0 ? true : false
        const host = (authNum & 0x100) !== 0 ? true : false
        const system = (authNum & 0x200) !== 0 ? true : false

        if (monitor) {
          role.push('monitor')
        }
        if (task) {
          role.push('task')
        }
        if (container) {
          role.push('container')
        }
        if (host) {
          role.push('host')
        }
        if (system) {
          role.push('system')
        }

        if (!data.role_name || data.role_name.length <= 0) {
          // reject('getInfo: roles must be a non-null array!')
          role.push('customer')
        } else {
          role.push(data.role_name)
        }

        commit('SET_CONTROL', control)
        commit('SET_UPDATA', update)
        commit('SET_READ', read)
        commit('SET_AUTHDELETE', authDelete)
        // 监控统计
        commit('SET_MONITOR', monitor)
        // 任务给管理
        commit('SET_TASK', task)
        // 容器管理
        commit('SET_CONTAINER', container)
        // 主机管理
        commit('SET_HOST', host)
        // 系统权限
        commit('SET_SYSTEM', system)
        commit('SET_ROLES', role)
        commit('SET_ROLE_ID', role_id)
        commit('SET_NAME', name)
        commit('SET_GROUP', group)
        commit('SET_ROLE_NAME', role_name)
        // commit('SET_AVATAR', avatar )
        commit('SET_GENDER', gender)
        commit('SET_STORE', data.state)
        commit('SET_EMAIL', email)
        if (!is_key_customer || is_key_customer.length <= 0) {
          // reject('getInfo: roles must be a non-null array!')
          commit('SET_ISKEYCUSTOMER', is_key_customer)
        }
        resolve(d)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      // logout(state.token).then(() => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      // 监控统计
      commit('SET_MONITOR', '')
      // 任务给管理
      commit('SET_TASK', '')
      // 容器管理
      commit('SET_CONTAINER', '')
      // 主机管理
      commit('SET_HOST', '')
      // 系统权限
      commit('SET_SYSTEM', '')

      commit('SET_NAME', '')
      commit('SET_AUTHDELETE', '')
      commit('SET_READ', '')
      commit('SET_CONTROL', '')
      commit('SET_UPDATA', '')
      commit('SET_GENDER', '')
      commit('SET_ROLE_NAME', '')
      commit('SET_USER_ID', '')
      commit('SET_ROLE_ID', '')
      // commit('SET_AVATAR', avatar )
      commit('SET_  GROUP', '')
      commit('SET_EMAIL', '')
      commit('SET_STORE', '')
      // commit('SET_COMPANY', '')
      commit('SET_ISKEYCUSTOMER', '')
      removeToken()
      removeUser_id()
      resetRouter()
      resolve()
      /* }).catch(error => {
        reject(error)
      }) */
    })
  },

  // remove token
  resetToken({
    commit
  }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      removeUser_id()
      resolve()
    })
  },

  // Dynamically modify permissions 动态修改权限
  changeRoles({
    commit,
    dispatch
  }, role) {
    return new Promise(async resolve => {
      // const token = role + '-token'
      console.log('----changeRoles---------role--------------------', role)
      // const token = role
      // commit('SET_TOKEN', token)
      // setToken(token)
      // setUser_id(token)
      const data = await dispatch('getInfo')
      const roles = []
      roles.push(data.role_name)
      let authNum
      try {
        authNum = role.modules[0].op || data.modules[0].op
      } catch (error) {
        authNum = 1006
      }

      const monitor = (authNum & 0x20) !== 0 ? true : false
      const task = (authNum & 0x40) !== 0 ? true : false
      const container = (authNum & 0x80) !== 0 ? true : false
      const host = (authNum & 0x100) !== 0 ? true : false
      const system = (authNum & 0x200) !== 0 ? true : false

      if (monitor) {
        roles.push('monitor')
      }
      if (task) {
        roles.push('task')
      }
      if (container) {
        roles.push('container')
      }
      if (host) {
        roles.push('host')
      }
      if (system) {
        roles.push('system')
      }
      resetRouter()
      // generate accessible routes map based on roles
      // const accessRoutes = await dispatch('permission/generateRoutes', roles)
      const accessRoutes = await dispatch('permission/generateRoutes', roles, {
        root: true
      })

      router.addRoutes(accessRoutes)
      console.log('user.js------------roles', roles)
      // router.push('/')
      // router.beforeEach(async (to, from, next) => {
      //   next({
      //     path: '/'
      //   })
      // })
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
