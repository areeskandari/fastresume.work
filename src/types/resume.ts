/**
 * Resume JSON schema — ATS-safe, single-column structure.
 * Used internally and for export; easy to extend for future templates.
 */

export type ResumeSectionId =
  | 'about'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'review'

export interface Contact {
  location?: string
  email?: string
  phone?: string
  linkedin?: string
  portfolio?: string
}

export interface About {
  fullName: string
  contact: Contact
  professionalSummary: string
}

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  isCurrent: boolean
  bullets: string[]
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  startYear: string
  endYear: string
}

export interface Skills {
  technical: string[]
  tools: string[]
  soft: string[]
}

export interface ProjectEntry {
  id: string
  name: string
  description: string
  url?: string
  bullets?: string[]
}

export interface ResumeData {
  about: About
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: Skills
  projects: ProjectEntry[]
}

export const RESUME_SECTION_ORDER: ResumeSectionId[] = [
  'about',
  'experience',
  'education',
  'skills',
  'projects',
  'review',
]

/** Placeholder content so users see the resume structure and can edit in place. */
export const DEFAULT_RESUME: ResumeData = {
  about: {
    fullName: 'Your full name',
    contact: {
      location: 'City, State or Country',
      email: 'email@example.com',
      phone: 'Phone number',
      linkedin: 'linkedin.com/in/yourprofile',
      portfolio: 'yoursite.com',
    },
    professionalSummary:
      'Write 3–4 sentences about your experience, key skills, and the impact you want to make. Use numbers where possible; we\'ll refine for ATS.',
  },
  experience: [
    createExperienceEntry({
      company: 'Company name',
      role: 'Job title',
      startMonth: 'Jan',
      startYear: '2022',
      endMonth: 'Dec',
      endYear: '2023',
      isCurrent: false,
      bullets: [
        'Achievement with numbers or impact (e.g. Increased X by 20%).',
        'Another key responsibility or result.',
      ],
    }),
  ],
  education: [
    createEducationEntry({
      institution: 'University or School',
      degree: 'Degree (e.g. B.S. Computer Science)',
      startYear: '2018',
      endYear: '2022',
    }),
  ],
  skills: {
    technical: ['JavaScript', 'Python', 'SQL'],
    tools: ['Figma', 'AWS', 'Jira'],
    soft: ['Leadership', 'Communication'],
  },
  projects: [
    createProjectEntry({
      name: 'Project name',
      description: 'Short description and your role.',
      url: 'https://example.com',
      bullets: ['Key result or tech used.'],
    }),
  ],
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function createExperienceEntry(partial?: Partial<ExperienceEntry>): ExperienceEntry {
  return {
    id: generateId(),
    company: '',
    role: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false,
    bullets: [],
    ...partial,
  }
}

export function createEducationEntry(partial?: Partial<EducationEntry>): EducationEntry {
  return {
    id: generateId(),
    institution: '',
    degree: '',
    startYear: '',
    endYear: '',
    ...partial,
  }
}

export function createProjectEntry(partial?: Partial<ProjectEntry>): ProjectEntry {
  return {
    id: generateId(),
    name: '',
    description: '',
    ...partial,
  }
}
