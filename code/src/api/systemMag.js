import request from '@/utils/request'
export function fetchList(query) {
  return request({
    url: 'tool_integration/v1/system/user',
    method: 'get',
    params: query
  })
}
export function createUser(data) {
  return request({
    url: 'tool_integration/v1/system/user',
    method: 'post',
    data
  })
}

export function editUser(data) {
  return request({
    url: `tool_integration/v1/system/user/${data.user_id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `tool_integration/v1/system/user/${id}`,
    method: 'delete'
  })
}
export function roleList(query) {
  return request({
    url: 'tool_integration/v1/system/role',
    method: 'get',
    params: query
  })
}
export function groupList() {
  return request({
    url: 'tool_integration/v1/system/groups',
    method: 'get'
  })
}

export function createRole(data) {
  return request({
    url: 'tool_integration/v1/system/role',
    method: 'post',
    data
  })
}

export function editRole(data) {
  return request({
    url: `tool_integration/v1/system/role/${data.role_id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `tool_integration/v1/system/role/${id}`,
    method: 'delete'
  })
}
