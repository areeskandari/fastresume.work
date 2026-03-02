import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  convertInchesToTwip,
} from 'docx'
import { saveAs } from 'file-saver'
import type { ResumeData } from '../types/resume'

/**
 * Editable DOCX export, ATS-safe single column.
 */

function contactLine(contact: ResumeData['about']['contact']): string {
  return [contact.location, contact.email, contact.phone, contact.linkedin, contact.portfolio]
    .filter(Boolean)
    .join(' | ')
}

export async function exportResumeToDocx(data: ResumeData, filename = 'resume.docx'): Promise<void> {
  const { about, experience, education, skills, projects } = data
  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      text: about.fullName || 'Your Name',
      heading: HeadingLevel.TITLE,
      spacing: { after: 80 },
    })
  )

  const contact = contactLine(about.contact)
  if (contact) {
    children.push(
      new Paragraph({
        children: [new TextRun(contact)],
        spacing: { after: 320 },
      })
    )
  }

  if (about.professionalSummary) {
    children.push(
      new Paragraph({
        text: 'Professional Summary',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      }),
      new Paragraph({
        children: [new TextRun(about.professionalSummary)],
        spacing: { after: 240 },
      })
    )
  }

  if (experience.length > 0) {
    children.push(
      new Paragraph({
        text: 'Work Experience',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    )
    for (const e of experience) {
      const start = [e.startMonth, e.startYear].filter(Boolean).join(' ')
      const end = e.isCurrent ? 'Present' : [e.endMonth, e.endYear].filter(Boolean).join(' ')
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${e.company} — ${e.role}`, bold: true }),
          ],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun(`${start} – ${end}`)],
          spacing: { after: 120 },
        })
      )
      for (const b of e.bullets) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${b}` })],
            indent: { left: convertInchesToTwip(0.25) },
            spacing: { after: 60 },
          })
        )
      }
    }
  }

  if (education.length > 0) {
    children.push(
      new Paragraph({
        text: 'Education',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    )
    for (const ed of education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${ed.institution} — ${ed.degree}`, bold: true }),
          ],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun(`${ed.startYear} – ${ed.endYear}`)],
          spacing: { after: 120 },
        })
      )
    }
  }

  if (skills.technical.length || skills.tools.length || skills.soft.length) {
    children.push(
      new Paragraph({
        text: 'Skills',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    )
    const skillLines: string[] = []
    if (skills.technical.length) skillLines.push(`Technical: ${skills.technical.join(', ')}`)
    if (skills.tools.length) skillLines.push(`Tools: ${skills.tools.join(', ')}`)
    if (skills.soft.length) skillLines.push(`Soft: ${skills.soft.join(', ')}`)
    children.push(
      new Paragraph({
        children: [new TextRun(skillLines.join('\n'))],
        spacing: { after: 240 },
      })
    )
  }

  if (projects.length > 0) {
    children.push(
      new Paragraph({
        text: 'Projects',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    )
    for (const p of projects) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: p.name + (p.url ? ` — ${p.url}` : ''), bold: true })],
          spacing: { after: 60 },
        })
      )
      if (p.description) {
        children.push(
          new Paragraph({
            children: [new TextRun(p.description)],
            spacing: { after: 120 },
          })
        )
      }
      if (p.bullets?.length) {
        for (const b of p.bullets) {
          children.push(
            new Paragraph({
              children: [new TextRun(`• ${b}`)],
              indent: { left: convertInchesToTwip(0.25) },
              spacing: { after: 60 },
            })
          )
        }
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
