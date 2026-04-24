import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const pieces = await readBody(event)
  const dir = join(process.cwd(), 'public', 'data')
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'gallery.json'), JSON.stringify(pieces, null, 2), 'utf-8')
  return { ok: true }
})
