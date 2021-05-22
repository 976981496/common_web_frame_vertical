import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'tool_integration/get_commons',
    method: 'get',
    params: query
  })
}

export function createCommon(data) {
  return request({
    url: 'tool_integration/add_license',
    method: 'post',
    data
  })
}
