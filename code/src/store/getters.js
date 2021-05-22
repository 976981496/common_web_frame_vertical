const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  addRoutes: state => state.permission.addRoutes,
  control: state => state.user.control, // 登陆时获取的权限
  update: state => state.user.update,
  read: state => state.user.read,
  authDelete: state => state.user.authDelete,
  user_id: state => state.user.user_id,
  email: state => state.user.email,
  gender: state => state.user.gender, // 用户性别
  store: state => state.user.store, // 登录状态是禁止还是许可
  role_name: state => state.user.role_name
}
export default getters
