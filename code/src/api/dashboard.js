import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/license/get_licenses',
    method: 'get',
    params: query
  })
}
export function createLicense(data) {
  return request({
    url: '/license/add_license',
    method: 'post',
    data
  })
}

export function updateLicense(data) {
  return request({
    url: '/license/update_license',
    method: 'post',
    data
  })
}

export function editLicense(data) {
  return request({
    url: '/license/edit_license',
    method: 'post',
    data
  })
}

export function deleteLicense(data) {
  return request({
    url: '/license/delete_license',
    method: 'post',
    data
  })
}
export function login(data) {
  return request({
    url: 'tool_integration/v1/system/login',
    method: 'post',
    data
  })
}

export function getInfo(id) {
  return request({
    url: `tool_integration/v1/system/user/${id}`,
    method: 'get'
  })
}

export function updatePsd(data) {
  return request({
    url: 'tool_integration/v1/system/update_passwd',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
