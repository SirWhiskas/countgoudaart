export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/admin') || path === '/admin/login') return

  const session = getCookie(event, 'admin_session')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || session !== adminPassword) {
    return sendRedirect(event, '/admin/login', 302)
  }
})
