import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg']

export default defineEventHandler(async () => {
  const dir = join(process.cwd(), 'public', 'art', 'gallery')
  try {
    const files = await readdir(dir)
    return files
      .filter(f => IMAGE_EXTS.some(ext => f.toLowerCase().endsWith(ext)))
      .map(f => `/art/gallery/${f}`)
  } catch {
    return []
  }
})
