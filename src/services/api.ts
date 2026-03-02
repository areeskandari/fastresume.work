const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function apiFetch(url: string, options: RequestInit) {
  const fullUrl = `${API_BASE}${url}`
  try {
    const res = await fetch(fullUrl, options)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || 'Request failed')
    }
    return res
  } catch (e) {
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
      const msg = import.meta.env.DEV
        ? 'Cannot reach server. Run "npm run dev:full" so the API runs on port 3001.'
        : 'Cannot reach server. Please check your connection or try again later.'
      throw new Error(msg)
    }
    throw e
  }
}

export interface CoverLetterInputs {
  companyName: string
  jobPosition: string
  basicInterests: string
  recipientName?: string
  recipientTitle?: string
}

export async function createEnhanceCheckout(): Promise<{ url: string }> {
  const res = await apiFetch('/api/create-enhance-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  return res.json()
}

export async function verifyEnhanceSession(sessionId: string): Promise<{ paid: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
    if (!res.ok) return { paid: false }
    return res.json()
  } catch {
    return { paid: false }
  }
}

export async function enhanceResume(
  resume: unknown,
  sessionId?: string
): Promise<{ enhanced: { professionalSummary?: string; experience?: Array<{ bullets?: string[] }> } }> {
  const res = await apiFetch('/api/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, session_id: sessionId }),
  })
  return res.json()
}

export async function createCoverLetterCheckout(): Promise<{ url: string }> {
  const res = await apiFetch('/api/create-cover-letter-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  return res.json()
}

export async function generateCoverLetter(
  resume: unknown,
  inputs: CoverLetterInputs,
  sessionId?: string
): Promise<{ letter: string }> {
  const res = await apiFetch('/api/cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, inputs, session_id: sessionId }),
  })
  return res.json()
}
