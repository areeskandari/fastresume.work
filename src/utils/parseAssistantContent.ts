const OPTIONS_MARKER = 'OPTIONS:'

/**
 * Parses LLM assistant content: strips OPTIONS line and returns content + options array.
 */
export function parseAssistantContent(raw: string): { content: string; options: string[] } {
  const idx = raw.indexOf(OPTIONS_MARKER)
  if (idx === -1) return { content: raw.trim(), options: [] }
  const content = raw.slice(0, idx).trim()
  const optionsStr = raw.slice(idx + OPTIONS_MARKER.length).trim()
  const options = optionsStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return { content, options }
}
