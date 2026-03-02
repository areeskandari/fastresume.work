import type { ResumeSectionId } from '../types/resume'

export type MessageRole = 'assistant' | 'user'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  sectionId: ResumeSectionId | null
  suggestions?: string[]
  clarification?: string
  hint?: string
  /** LLM-generated select options for this question (e.g. "1 year", "2 years", "Other") */
  options?: string[]
}

export interface FlowState {
  currentSection: ResumeSectionId
  stepIndex: number
  isComplete: boolean
}

export interface AnalysisResult {
  keywords: string[]
  weakPhrases: string[]
  suggestedRewrites: string[]
  duplicateSkills: string[]
  tips: string[]
}
