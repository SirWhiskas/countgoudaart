import { useServerConfig } from './useServerConfig'

// TODO: Replace with actual API calls once the backend is wired up.
// The reference-library backend serves images from a local folder via /api/refs/*.

const API = '/api/refs'

function buildHeaders(): Record<string, string> {
  const { apiKey } = useServerConfig()
  const headers: Record<string, string> = { 'ngrok-skip-browser-warning': '1' }
  if (apiKey.value) headers['x-api-key'] = apiKey.value
  return headers
}

export interface ImageNode {
  key: string
  label: string
  data?: string
  path: string
  children?: ImageNode[]
}

export interface GalleryImage {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt: string
  title: string
}

export async function useGetImageData(): Promise<ImageNode[]> {
  const { serverUrl } = useServerConfig()
  if (!serverUrl.value) return []
  try {
    const res = await fetch(`${serverUrl.value}${API}/images`, { headers: buildHeaders() })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function useGetImageFolder(): Promise<ImageNode[]> {
  const { serverUrl } = useServerConfig()
  if (!serverUrl.value) return []
  try {
    const res = await fetch(`${serverUrl.value}${API}/folders`, { headers: buildHeaders() })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export function useGetImagePath(image: string): string {
  const { serverUrl } = useServerConfig()
  if (!serverUrl.value) return image
  const fullUrl = `${serverUrl.value}${API}/images${image}`
  return `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`
}
