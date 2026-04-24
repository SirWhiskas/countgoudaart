import { ref, readonly } from 'vue'

const LS_KEY = 'gesture-timer-server-url'

// Module-level singleton — shared across all composable calls client-side
const serverUrl = ref<string | null>(null)
let initialized = false

function init() {
  if (!initialized && import.meta.client) {
    serverUrl.value = localStorage.getItem(LS_KEY)
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

  const testConnection = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/api/refs/images`, {
        signal: AbortSignal.timeout(5000),
        headers: { 'ngrok-skip-browser-warning': '1' },
      })
      return res.ok
    } catch {
      return false
    }
  }

  return { serverUrl: readonly(serverUrl), setServerUrl, testConnection }
}
