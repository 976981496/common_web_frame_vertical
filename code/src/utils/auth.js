import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
const User_idKey = 'user_id'

export function getUser_id() {
  return Cookies.get(User_idKey)
}

export function setUser_id(user_id) {
  return Cookies.set(User_idKey, user_id)
}

export function removeUser_id() {
  return Cookies.remove(User_idKey)
}

