import { ref, readonly } from 'vue'

const LS_KEY = 'gesture-timer-server-url'
const LS_KEY_APIKEY = 'gesture-timer-api-key'

// Module-level singleton — shared across all composable calls client-side
const serverUrl = ref<string | null>(null)
const apiKey = ref<string | null>(null)
let initialized = false

function init() {
  if (!initialized && import.meta.client) {
    serverUrl.value = localStorage.getItem(LS_KEY)
    apiKey.value = localStorage.getItem(LS_KEY_APIKEY)
    initialized = true
  }
}

export function useServerConfig() {
  init()

  const setServerUrl = (url: string | null) => {
    const clean = url ? url.replace(/\/$/, '') : null
    serverUrl.value = clean
    if (import.meta.client) {
      if (clean) localStorage.setItem(LS_KEY, clean)
      else localStorage.removeItem(LS_KEY)
    }
  }

  const setApiKey = (key: string | null) => {
    const clean = key?.trim() || null
    apiKey.value = clean
    if (import.meta.client) {
      if (clean) localStorage.setItem(LS_KEY_APIKEY, clean)
      else localStorage.removeItem(LS_KEY_APIKEY)
    }
  }

  const testConnection = async (url: string, key?: string): Promise<boolean> => {
    try {
      const headers: Record<string, string> = { 'ngrok-skip-browser-warning': '1' }
      const k = key?.trim() || apiKey.value
      if (k) headers['x-api-key'] = k
      const res = await fetch(`${url.replace(/\/$/, '')}/api/refs/images`, {
        signal: AbortSignal.timeout(5000),
        headers,
      })
      return res.ok
    } catch {
      return false
    }
  }

  return { serverUrl: readonly(serverUrl), apiKey: readonly(apiKey), setServerUrl, setApiKey, testConnection }
}
