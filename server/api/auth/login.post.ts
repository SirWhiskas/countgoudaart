export default defineEventHandler(async (event) => {
  const { password } = await readBody<{ password: string }>(event)
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    throw createError({ statusCode: 500, message: 'ADMIN_PASSWORD env var not set' })
  }

  if (password !== adminPassword) {
    throw createError({ statusCode: 401, message: 'Invalid password' })
  }

  setCookie(event, 'admin_session', adminPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { ok: true }
})
