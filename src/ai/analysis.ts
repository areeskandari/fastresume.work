/**
 * Local intelligence: keyword extraction, weak phrase detection,
 * achievement rewriting, duplicate skill detection.
 * AI layer is separate — can be swapped for LLM API.
 */

const WEAK_PHRASES = [
  'responsible for',
  'hardworking',
  'hard-working',
  'detail oriented',
  'detail-oriented',
  'team player',
  'go-getter',
  'synergy',
  'think outside the box',
  'results-driven',
  'self-starter',
  'helped with',
  'assisted with',
  'worked on',
  'duties include',
  'duties included',
]

const STRONG_VERBS = [
  'Led', 'Managed', 'Delivered', 'Increased', 'Reduced', 'Launched',
  'Built', 'Designed', 'Implemented', 'Optimized', 'Streamlined',
  'Drove', 'Spearheaded', 'Achieved', 'Scaled', 'Transformed',
]

function normalizeWord(w: string): string {
  return w.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

export function extractKeywords(text: string): string[] {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  ])
  const words = text.split(/\s+/).map(normalizeWord).filter(Boolean)
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of words) {
    if (w.length < 2 || stop.has(w) || seen.has(w)) continue
    seen.add(w)
    out.push(w)
  }
  return out
}

export function detectWeakPhrases(text: string): string[] {
  const lower = text.toLowerCase()
  return WEAK_PHRASES.filter((phrase) => lower.includes(phrase))
}

export function suggestStrongerWording(bullet: string): string[] {
  const weak = detectWeakPhrases(bullet)
  if (weak.length === 0) return []

  const suggestions: string[] = []
  let rewritten = bullet

  if (rewritten.toLowerCase().includes('responsible for')) {
    rewritten = rewritten.replace(/\bresponsible for\b/gi, 'Led')
    suggestions.push(rewritten)
  }
  if (bullet.toLowerCase().includes('helped with') || bullet.toLowerCase().includes('assisted with')) {
    rewritten = bullet.replace(/\b(helped|assisted) with\b/gi, 'Supported')
    suggestions.push(rewritten)
  }
  if (bullet.toLowerCase().includes('worked on')) {
    rewritten = bullet.replace(/\bworked on\b/gi, 'Delivered')
    suggestions.push(rewritten)
  }

  if (suggestions.length === 0 && weak.length > 0) {
    suggestions.push(`Try starting with a strong verb: ${STRONG_VERBS.slice(0, 5).join(', ')}...`)
  }
  return suggestions
}

export function findDuplicateSkills(skills: string[]): string[] {
  const normalized = skills.map((s) => normalizeWord(s))
  const counts = new Map<string, number>()
  for (const n of normalized) counts.set(n, (counts.get(n) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([, c]) => c > 1)
    .map(([n]) => skills[normalized.indexOf(n)])
}

export function analyzeText(text: string): {
  keywords: string[]
  weakPhrases: string[]
  suggestedRewrites: string[]
} {
  const keywords = extractKeywords(text)
  const weakPhrases = detectWeakPhrases(text)
  const suggestedRewrites = suggestStrongerWording(text)
  return { keywords, weakPhrases, suggestedRewrites }
}

export function matchJobDescription(resumeText: string, jdText: string): {
  resumeKeywords: string[]
  jdKeywords: string[]
  missingInResume: string[]
  inBoth: string[]
} {
  const resumeKw = [...new Set(extractKeywords(resumeText))]
  const jdKw = [...new Set(extractKeywords(jdText))]
  const resumeSet = new Set(resumeKw)
  const inBoth = jdKw.filter((k) => resumeSet.has(k))
  const missingInResume = jdKw.filter((k) => !resumeSet.has(k))
  return {
    resumeKeywords: resumeKw,
    jdKeywords: jdKw,
    missingInResume,
    inBoth,
  }
}
