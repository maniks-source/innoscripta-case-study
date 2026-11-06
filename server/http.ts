const TIMEOUT_MS = 8000

export async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 180)}` : ''}`)
    }
    return response
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(url, init)
  return (await response.json()) as T
}

export async function fetchText(url: string, init?: RequestInit) {
  const response = await fetchWithTimeout(url, init)
  return response.text()
}

export function compactParams(params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  return search
}
