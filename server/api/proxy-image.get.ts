export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing url parameter' })
  }

  const response = await fetch(url, {
    headers: { 'ngrok-skip-browser-warning': '1' },
  })

  if (!response.ok) {
    throw createError({ statusCode: response.status })
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', 'private, max-age=3600')

  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
})
