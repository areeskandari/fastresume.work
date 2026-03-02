/**
 * AI orchestration: controls conversational flow, one section at a time.
 * Uses local prompts; can be extended to call LLM for follow-ups and rewrites.
 */

import type { ResumeSectionId } from '../types/resume'
import { RESUME_SECTION_ORDER } from '../types/resume'
import { getNextStep, SECTION_LABELS, SECTION_PROMPTS } from './prompts'
import {
  findDuplicateSkills,
  suggestStrongerWording,
  detectWeakPhrases,
} from './analysis'
import type { ChatMessage } from './types'

export interface OrchestratorState {
  sectionId: ResumeSectionId
  stepIndex: number
  subIndex: number // e.g. which experience/education entry
}

export function getInitialOrchestratorState(): OrchestratorState {
  return { sectionId: 'about', stepIndex: 0, subIndex: 0 }
}

export function getSectionLabel(sectionId: ResumeSectionId): string {
  return SECTION_LABELS[sectionId]
}

export function getNextQuestion(state: OrchestratorState): string | null {
  const step = getNextStep(state.sectionId, state.stepIndex)
  return step?.question ?? null
}

export function getNextQuestionWithHint(state: OrchestratorState): {
  question: string
  hint?: string
  options?: string[]
} | null {
  const step = getNextStep(state.sectionId, state.stepIndex)
  if (!step) return null
  return { question: step.question, hint: step.hint, options: step.options }
}

export function advanceState(
  state: OrchestratorState,
  userInput: string,
  _context: { experienceCount: number; educationCount: number; projectCount: number }
): OrchestratorState {
  const normalized = userInput.trim().toLowerCase()
  const step = getNextStep(state.sectionId, state.stepIndex)
  const field = step?.field

  // "add another" branches
  if (field === 'addAnother' && (normalized === 'yes' || normalized === 'y')) {
    if (state.sectionId === 'experience')
      return { ...state, stepIndex: 0, subIndex: state.subIndex + 1 }
    if (state.sectionId === 'education')
      return { ...state, stepIndex: 0, subIndex: state.subIndex + 1 }
    if (state.sectionId === 'projects')
      return { ...state, stepIndex: 0, subIndex: state.subIndex + 1 }
  }

  if (field === 'addAnother' && (normalized === 'no' || normalized === 'n')) {
    const nextSectionIndex = RESUME_SECTION_ORDER.indexOf(state.sectionId) + 1
    if (nextSectionIndex >= RESUME_SECTION_ORDER.length)
      return { sectionId: 'review', stepIndex: 0, subIndex: 0 }
    return {
      sectionId: RESUME_SECTION_ORDER[nextSectionIndex],
      stepIndex: 0,
      subIndex: 0,
    }
  }

  // "are you still working here?" — if yes, skip end month/year and go to bullets
  if (field === 'isCurrent') {
    if (normalized === 'yes' || normalized === 'y' || normalized === 'current')
      return { ...state, stepIndex: state.stepIndex + 3 } // skip endMonth, endYear
    return { ...state, stepIndex: state.stepIndex + 1 } // no → ask end month
  }

  const nextStepIndex = state.stepIndex + 1
  const steps = getStepsForSection(state.sectionId)
  if (nextStepIndex < steps) {
    return { ...state, stepIndex: nextStepIndex }
  }

  // End of section
  const nextSectionIndex = RESUME_SECTION_ORDER.indexOf(state.sectionId) + 1
  if (nextSectionIndex >= RESUME_SECTION_ORDER.length) {
    return { sectionId: 'review', stepIndex: 0, subIndex: 0 }
  }
  return {
    sectionId: RESUME_SECTION_ORDER[nextSectionIndex],
    stepIndex: 0,
    subIndex: 0,
  }
}

function getStepsForSection(sectionId: ResumeSectionId): number {
  return SECTION_PROMPTS[sectionId]?.length ?? 0
}

export function analyzeUserInput(
  input: string,
  sectionId: ResumeSectionId,
  skillsArrays?: { technical: string[]; tools: string[]; soft: string[] }
): {
  clarification: string | null
  suggestions: string[]
  tips: string[]
} {
  const tips: string[] = []
  let clarification: string | null = null
  const suggestions: string[] = []

  const weak = detectWeakPhrases(input)
  if (weak.length > 0) {
    tips.push(`Avoid weak phrases: "${weak.join('", "')}". Use strong action verbs instead.`)
    const rewrites = suggestStrongerWording(input)
    suggestions.push(...rewrites)
  }

  if (sectionId === 'experience' && input.length > 0) {
    const hasNumber = /\d+%|\d+\s*(users?|customers?|team|people|€|\$|k|M)/i.test(input)
    if (!hasNumber && input.split('\n').some((l) => l.trim().length > 15)) {
      clarification =
        'Adding numbers (%, $, team size) makes achievements stronger. Can you add any metrics?'
    }
  }

  if (sectionId === 'skills' && skillsArrays) {
    const all = [
      ...skillsArrays.technical,
      ...skillsArrays.tools,
      ...skillsArrays.soft,
    ]
    const dups = findDuplicateSkills(all)
    if (dups.length > 0) {
      tips.push(`Duplicate skills detected: ${dups.join(', ')}. Consider merging.`)
    }
  }

  return { clarification, suggestions, tips }
}

export function buildAssistantMessage(
  content: string,
  sectionId: ResumeSectionId | null,
  options?: { suggestions?: string[]; clarification?: string }
): Omit<ChatMessage, 'id'> {
  return {
    role: 'assistant',
    content,
    sectionId,
    suggestions: options?.suggestions,
    clarification: options?.clarification,
  }
}
