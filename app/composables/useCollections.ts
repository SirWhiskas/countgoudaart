import { ref, computed } from 'vue'
import type { ImageNode } from '~/utils/gestureTimerUtils'

const COLLECTION_PREFIX = 'userCollection-'

// Shared reactive tick — incrementing forces computed properties to re-derive
const _tick = ref(0)

function getAllCollectionKeys(): string[] {
  if (!import.meta.client) return []
  return Object.keys(localStorage).filter(k => k.startsWith(COLLECTION_PREFIX))
}

function nameFromKey(key: string): string {
  return key.slice(COLLECTION_PREFIX.length)
}

function labelFromSrc(src: string): string {
  try {
    const urlParam = new URL(src, 'http://x').searchParams.get('url')
    if (urlParam) return decodeURIComponent(urlParam).split('/').pop() ?? src
  } catch { /* non-proxy src */ }
  return src.split('/').pop()?.split('?')[0] ?? src
}

export function useCollections() {
  const collectionNames = computed((): string[] => {
    _tick.value
    return getAllCollectionKeys().map(nameFromKey).sort()
  })

  const addToCollection = (name: string, imageSrc: string) => {
    if (!import.meta.client) return
    const key = `${COLLECTION_PREFIX}${name}`
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (!existing.includes(imageSrc)) {
      existing.push(imageSrc)
      localStorage.setItem(key, JSON.stringify(existing))
    }
    _tick.value++
  }

  const collectionsAsTree = computed((): ImageNode[] => {
    _tick.value
    return getAllCollectionKeys().map((key, ki) => {
      const name = nameFromKey(key)
      const srcs: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
      return {
        key: `collection-${ki}`,
        label: name,
        path: name,
        children: srcs.map((src, si) => ({
          key: `collection-${ki}-${si}`,
          label: labelFromSrc(src),
          path: src,
        })),
      }
    })
  })

  return { collectionNames, addToCollection, collectionsAsTree }
}
