import { DEFAULT_RESUME, type ResumeData, createExperienceEntry } from '../types/resume'

function extractEmail(text: string): string | undefined {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]
}

function extractLinkedIn(text: string): string | undefined {
  const match = text.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s]+/i)
  return match?.[0]
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/(\+?\d[\d\s().-]{7,})/)
  return match?.[0]?.trim()
}

export function estimateResumeFromText(rawText: string): ResumeData {
  const base: ResumeData = {
    ...DEFAULT_RESUME,
    experience: [],
    education: [],
    projects: [],
  }

  const text = rawText.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  if (lines.length === 0) return base

  // Assume first non-empty line is the name (best-effort).
  const fullName = lines[0]

  const email = extractEmail(text)
  const linkedin = extractLinkedIn(text)
  const phone = extractPhone(text)

  // Take next few lines as a rough professional summary until a blank or heading-like line.
  const summaryLines: string[] = []
  for (let i = 1; i < lines.length && summaryLines.length < 5; i++) {
    const line = lines[i]
    if (/^(experience|work experience|professional experience|education|skills|projects?)\b/i.test(line)) {
      break
    }
    summaryLines.push(line)
  }

  const professionalSummary =
    summaryLines.join(' ').slice(0, 800) ||
    'Imported from your existing resume. Review and refine this summary for clarity and impact.'

  // Very simple bullet extraction: treat lines that look like bullets as experience bullets.
  const bulletLines = lines.filter((l) => /^[-•*]/.test(l) || l.endsWith('.') || l.length > 60)
  const bullets = bulletLines
    .map((b) => b.replace(/^[-•*]\s*/, '').trim())
    .filter((b, i, arr) => b && arr.indexOf(b) === i)

  const experienceEntry = createExperienceEntry({
    company: '',
    role: '',
    bullets: bullets.slice(0, 12),
  })

  return {
    ...base,
    about: {
      fullName,
      contact: {
        ...base.about.contact,
        email: email || base.about.contact.email,
        phone: phone || base.about.contact.phone,
        linkedin: linkedin || base.about.contact.linkedin,
      },
      professionalSummary,
    },
    experience: bullets.length ? [experienceEntry] : base.experience,
  }
}

