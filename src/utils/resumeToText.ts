import type { ResumeData } from '../types/resume'

/**
 * Single-column plain text representation for JD matching and export.
 */

export function getResumeAsPlainText(data: ResumeData): string {
  const parts: string[] = []

  parts.push(data.about.fullName || '')
  const contact = [
    data.about.contact.location,
    data.about.contact.email,
    data.about.contact.phone,
    data.about.contact.linkedin,
    data.about.contact.portfolio,
  ].filter(Boolean)
  if (contact.length) parts.push(contact.join(' | '))
  if (data.about.professionalSummary) parts.push('\n' + data.about.professionalSummary)

  if (data.experience.length > 0) {
    parts.push('\n\nWORK EXPERIENCE')
    for (const e of data.experience) {
      parts.push(`${e.company} — ${e.role}`)
      const start = [e.startMonth, e.startYear].filter(Boolean).join(' ')
      const end = e.isCurrent ? 'Present' : [e.endMonth, e.endYear].filter(Boolean).join(' ')
      parts.push(`${start} – ${end}`)
      for (const b of e.bullets) parts.push('• ' + b)
      parts.push('')
    }
  }

  if (data.education.length > 0) {
    parts.push('EDUCATION')
    for (const ed of data.education) {
      parts.push(`${ed.institution} — ${ed.degree}`)
      parts.push(`${ed.startYear} – ${ed.endYear}`)
      parts.push('')
    }
  }

  if (data.skills.technical.length || data.skills.tools.length || data.skills.soft.length) {
    parts.push('SKILLS')
    if (data.skills.technical.length) parts.push('Technical: ' + data.skills.technical.join(', '))
    if (data.skills.tools.length) parts.push('Tools: ' + data.skills.tools.join(', '))
    if (data.skills.soft.length) parts.push('Soft: ' + data.skills.soft.join(', '))
  }

  if (data.projects.length > 0) {
    parts.push('\nPROJECTS')
    for (const p of data.projects) {
      parts.push(p.name + (p.url ? ' — ' + p.url : ''))
      parts.push(p.description)
      if (p.bullets?.length) for (const b of p.bullets) parts.push('• ' + b)
      parts.push('')
    }
  }

  return parts.join('\n')
}
