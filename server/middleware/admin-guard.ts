export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  const isAdminPage = path.startsWith('/admin') && path !== '/admin/login'
  const isAdminApi = path.startsWith('/api/admin')

  if (!isAdminPage && !isAdminApi) return

  const session = getCookie(event, 'admin_session')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || session !== adminPassword) {
    if (isAdminApi) throw createError({ statusCode: 401, message: 'Unauthorized' })
    return sendRedirect(event, '/admin/login', 302)
  }
})
