import type { ResumeSectionId } from '../types/resume'

export const SECTION_LABELS: Record<ResumeSectionId, string> = {
  about: 'About',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  review: 'Review',
}

interface SectionStep {
  question: string
  field?: string
  hint?: string
}

export const SECTION_PROMPTS: Record<ResumeSectionId, SectionStep[]> = {
  about: [
    { question: "What's your full name?", field: 'fullName' },
    {
      question: 'Where are you based? (City, State or Country)',
      field: 'location',
      hint: 'Helps recruiters with location-based roles.',
    },
    { question: 'What email should recruiters use?', field: 'email' },
    { question: 'Phone number? (optional)', field: 'phone' },
    { question: 'LinkedIn profile URL? (optional)', field: 'linkedin' },
    { question: 'Portfolio or personal site? (optional)', field: 'portfolio' },
    {
      question:
        "Write a short professional summary (3–4 lines). Focus on years of experience, key skills, and the impact you want to make. We'll refine it for ATS.",
      field: 'professionalSummary',
      hint: 'Use numbers and outcomes where possible.',
    },
  ],
  experience: [
    { question: "What's the company name?", field: 'company' },
    { question: 'What was your job title?', field: 'role' },
    { question: 'Start month (e.g. Jan)?', field: 'startMonth' },
    { question: 'Start year?', field: 'startYear' },
    { question: 'Are you still working here?', field: 'isCurrent' },
    { question: 'End month (e.g. Dec)?', field: 'endMonth' },
    { question: 'End year?', field: 'endYear' },
    {
      question:
        "List 2–4 achievements with numbers or impact (e.g. 'Increased revenue by 20%', 'Led a team of 5'). One per line.",
      field: 'bullets',
      hint: 'Start with strong verbs: Led, Delivered, Built, Increased.',
    },
    { question: 'Add another job? (yes/no)', field: 'addAnother' },
  ],
  education: [
    { question: 'Institution name?', field: 'institution' },
    { question: 'Degree (e.g. B.S. Computer Science)?', field: 'degree' },
    { question: 'Start year?', field: 'startYear' },
    { question: 'End year?', field: 'endYear' },
    { question: 'Add another degree? (yes/no)', field: 'addAnother' },
  ],
  skills: [
    {
      question: 'List technical skills (e.g. JavaScript, Python, SQL). Comma-separated.',
      field: 'technical',
    },
    {
      question: 'Tools & platforms (e.g. Figma, AWS, Jira). Comma-separated.',
      field: 'tools',
    },
    {
      question: 'Soft skills (e.g. Leadership, Communication). Comma-separated.',
      field: 'soft',
    },
  ],
  projects: [
    { question: 'Project name?', field: 'name' },
    { question: 'Short description and your role?', field: 'description' },
    { question: 'URL? (optional)', field: 'url' },
    { question: 'Key results or tech used? One per line. (optional)', field: 'bullets' },
    { question: 'Add another project? (yes/no)', field: 'addAnother' },
  ],
  review: [
    {
      question:
        "Your resume is ready. You can paste a job description below to see keyword gaps, or go to Export for PDF/DOCX/Text.",
      field: 'jdPaste',
    },
  ],
}

export function getNextStep(
  sectionId: ResumeSectionId,
  stepIndex: number
): { question: string; field?: string; hint?: string } | null {
  const steps = SECTION_PROMPTS[sectionId]
  if (!steps || stepIndex >= steps.length) return null
  return steps[stepIndex]
}
