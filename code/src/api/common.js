import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'tool_integration/get_users',
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: 'tool_integration/add_user',
    method: 'post',
    data
  })
}

export function editUser(data) {
  return request({
    url: 'tool_integration/edit_user',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: 'tool_integration/delete_user',
    method: 'post',
    data
  })
}

