import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useResume } from '../context/ResumeContext'
import {
  getInitialOrchestratorState,
  getNextQuestionWithHint,
  advanceState,
  analyzeUserInput,
  getSectionLabel,
  buildAssistantMessage,
} from '../ai/orchestrator'
import { getNextStep } from '../ai/prompts'
import type { OrchestratorState } from '../ai/orchestrator'
import type { ChatMessage } from '../ai/types'
import { RESUME_SECTION_ORDER } from '../types/resume'
import { ProgressIndicator } from './chat/ProgressIndicator'
import { ChatMessages } from './chat/ChatMessages'
import { ChatInput } from './chat/ChatInput'
import { JDMatchingPanel } from './chat/JDMatchingPanel'
import { getAssistantReply } from '../services/openrouter'
import { parseAssistantContent } from '../utils/parseAssistantContent'
import { analytics } from '../analytics'
import { estimateResumeFromText } from '../utils/importPdf'
import styles from '../styles/ApplyAssistant.module.css'

function createMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ApplyAssistant() {
  const {
    resume,
    updateAbout,
    addExperience,
    updateExperience,
    addEducation,
    updateEducation,
    updateSkills,
    addProject,
    updateProject,
    setResume,
  } = useResume()
  const [flowState, setFlowState] = useState<OrchestratorState>(getInitialOrchestratorState())
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const next = getNextQuestionWithHint(getInitialOrchestratorState())
    return [
      {
        id: createMessageId(),
        role: 'assistant',
        content: next?.question ?? "Let's build your resume. What's your full name?",
        sectionId: 'about',
        hint: next?.hint,
        options: next?.options,
      },
    ]
  })
  const [jdPanelOpen, setJdPanelOpen] = useState(false)
  const [llmLoading, setLlmLoading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'reading' | 'uploading' | 'mapping' | 'done'>('idle')
  const [importError, setImportError] = useState<string | null>(null)
  const [importRaw, setImportRaw] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null)
  const importFileRef = useRef<HTMLInputElement | null>(null)
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY
  const apiBase = import.meta.env.VITE_API_URL ?? ''

  useEffect(() => {
    if (!llmLoading) chatInputRef.current?.focus()
  }, [llmLoading])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const applyUserInputToResume = useCallback(
    (state: OrchestratorState, input: string, field?: string) => {
      const trimmed = input.trim()
      if (!field || !trimmed) return

      switch (state.sectionId) {
        case 'about': {
          if (field === 'fullName') updateAbout({ fullName: trimmed })
          else if (field === 'location') updateAbout({ contact: { ...resume.about.contact, location: trimmed } })
          else if (field === 'email') updateAbout({ contact: { ...resume.about.contact, email: trimmed } })
          else if (field === 'phone') updateAbout({ contact: { ...resume.about.contact, phone: trimmed } })
          else if (field === 'linkedin') updateAbout({ contact: { ...resume.about.contact, linkedin: trimmed } })
          else if (field === 'portfolio') updateAbout({ contact: { ...resume.about.contact, portfolio: trimmed } })
          else if (field === 'professionalSummary') updateAbout({ professionalSummary: trimmed })
          break
        }
        case 'experience': {
          const idx = state.subIndex
          if (!resume.experience[idx]) return
          const e = resume.experience[idx]
          if (field === 'company') updateExperience(e.id, { company: trimmed })
          else if (field === 'role') updateExperience(e.id, { role: trimmed })
          else if (field === 'startMonth') updateExperience(e.id, { startMonth: trimmed })
          else if (field === 'startYear') updateExperience(e.id, { startYear: trimmed })
          else if (field === 'endMonth') updateExperience(e.id, { endMonth: trimmed })
          else if (field === 'endYear') updateExperience(e.id, { endYear: trimmed })
          else if (field === 'isCurrent') updateExperience(e.id, { isCurrent: /yes|y|current/i.test(trimmed) })
          else if (field === 'bullets') {
            const bullets = trimmed.split(/\n/).map((b) => b.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            updateExperience(e.id, { bullets })
          }
          break
        }
        case 'education': {
          const idx = state.subIndex
          if (!resume.education[idx]) return
          const ed = resume.education[idx]
          if (field === 'institution') updateEducation(ed.id, { institution: trimmed })
          else if (field === 'degree') updateEducation(ed.id, { degree: trimmed })
          else if (field === 'startYear') updateEducation(ed.id, { startYear: trimmed })
          else if (field === 'endYear') updateEducation(ed.id, { endYear: trimmed })
          break
        }
        case 'skills': {
          const list = trimmed.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
          if (field === 'technical') updateSkills({ technical: list })
          else if (field === 'tools') updateSkills({ tools: list })
          else if (field === 'soft') updateSkills({ soft: list })
          break
        }
        case 'projects': {
          const idx = state.subIndex
          if (!resume.projects[idx]) return
          const p = resume.projects[idx]
          if (field === 'name') updateProject(p.id, { name: trimmed })
          else if (field === 'description') updateProject(p.id, { description: trimmed })
          else if (field === 'url') updateProject(p.id, { url: trimmed })
          else if (field === 'bullets') {
            const bullets = trimmed.split(/\n/).map((b) => b.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            updateProject(p.id, { bullets })
          }
          break
        }
        default:
          break
      }
    },
    [resume, updateAbout, updateExperience, updateEducation, updateSkills, updateProject]
  )

  const handleSend = useCallback(
    (input: string) => {
      if (!input.trim()) return

      const state = flowState
      const currentStep = getNextStep(state.sectionId, state.stepIndex)
      const field = currentStep?.field

      if (messages.length === 1) analytics.chatStart()
      analytics.chatMessage(state.sectionId)

      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: 'user', content: input.trim(), sectionId: state.sectionId },
      ])

      applyUserInputToResume(state, input, field)

      const analysis = analyzeUserInput(input, state.sectionId, resume.skills)
      const nextState = advanceState(state, input, {
        experienceCount: resume.experience.length,
        educationCount: resume.education.length,
        projectCount: resume.projects.length,
      })

      if (nextState.sectionId === 'experience' && resume.experience.length <= nextState.subIndex) {
        addExperience()
      }
      if (nextState.sectionId === 'education' && resume.education.length <= nextState.subIndex) {
        addEducation()
      }
      if (nextState.sectionId === 'projects' && resume.projects.length <= nextState.subIndex) {
        addProject()
      }

      setFlowState(nextState)
      if (nextState.sectionId !== state.sectionId) {
        analytics.sectionComplete(state.sectionId)
      }

      const nextStep = getNextQuestionWithHint(nextState)
      const fallbackContent = nextStep?.question ?? (nextState.sectionId === 'review' ? "You're all set. Paste a job description to check keyword match, or export your resume." : "What's next?")
      const sectionLabel = getSectionLabel(nextState.sectionId)

      const pushAssistantMessage = (rawContent: string) => {
        const { content, options } = parseAssistantContent(rawContent)
        const assistantMsg = buildAssistantMessage(content, nextState.sectionId, {
          suggestions: analysis.suggestions.length > 0 ? analysis.suggestions : undefined,
          clarification: analysis.clarification ?? undefined,
        })
        setMessages((prev) => [
          ...prev,
          {
            ...assistantMsg,
            id: createMessageId(),
            content,
            hint: nextStep?.hint,
            options: options.length > 0 ? options : nextStep?.options,
          } as ChatMessage,
        ])
      }

      if (openRouterKey) {
        setLlmLoading(true)
        getAssistantReply(sectionLabel, fallbackContent, input.trim(), undefined)
          .then((content) => pushAssistantMessage(content || fallbackContent))
          .catch(() => pushAssistantMessage(fallbackContent))
          .finally(() => setLlmLoading(false))
      } else {
        pushAssistantMessage(fallbackContent)
      }
    },
    [
      flowState,
      messages.length,
      resume,
      applyUserInputToResume,
      addExperience,
      addEducation,
      addProject,
      openRouterKey,
    ]
  )

  const handleSkip = useCallback(() => {
    const state = flowState
    if (state.sectionId === 'review') return

    setMessages((prev) => [
      ...prev,
      { id: createMessageId(), role: 'user', content: '—', sectionId: state.sectionId },
    ])

    const nextState = advanceState(state, 'skip', {
      experienceCount: resume.experience.length,
      educationCount: resume.education.length,
      projectCount: resume.projects.length,
    })

    if (nextState.sectionId === 'experience' && resume.experience.length <= nextState.subIndex) {
      addExperience()
    }
    if (nextState.sectionId === 'education' && resume.education.length <= nextState.subIndex) {
      addEducation()
    }
    if (nextState.sectionId === 'projects' && resume.projects.length <= nextState.subIndex) {
      addProject()
    }

    setFlowState(nextState)
    if (nextState.sectionId !== state.sectionId) {
      analytics.sectionComplete(state.sectionId)
    }

    const nextStep = getNextQuestionWithHint(nextState)
    const fallbackContent =
      nextStep?.question ??
      (nextState.sectionId === 'review'
        ? "You're all set. Paste a job description to check keyword match, or export your resume."
        : "What's next?")
    const assistantMsg = buildAssistantMessage(fallbackContent, nextState.sectionId, {})
    setMessages((prev) => [
      ...prev,
      {
        ...assistantMsg,
        id: createMessageId(),
        content: fallbackContent,
        hint: nextStep?.hint,
        options: nextStep?.options,
      } as ChatMessage,
    ])
  }, [flowState, resume.experience.length, resume.education.length, resume.projects.length, addExperience, addEducation, addProject])

  const handleOpenImport = () => {
    setImportOpen(true)
    setImportStatus('idle')
    setImportError(null)
    setImportRaw('')
  }

  const handleCloseImport = () => {
    setImportOpen(false)
    setImportStatus('idle')
    setImportError(null)
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setImportError(null)
    const fileInput = importFileRef.current
    const file = fileInput?.files?.[0]
    if (!file) {
      setImportError('Please choose a PDF resume first.')
      return
    }
    if (!/\.pdf$/i.test(file.name)) {
      setImportError('Please upload a PDF file.')
      return
    }
    try {
      setImportStatus('reading')
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)

      setImportStatus('uploading')
      const res = await fetch(`${apiBase}/api/import-resume-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Import failed')
      }
      const { text } = (await res.json()) as { text: string }
      setImportRaw(text)

      setImportStatus('mapping')
      const mapped = estimateResumeFromText(text)
      setResume(mapped)
      setImportStatus('done')
    } catch (err) {
      setImportStatus('idle')
      setImportError(err instanceof Error ? err.message : 'Import failed')
    }
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Fast Resume</Link>
            </h1>
            <p className={styles.subtitle}>
              ☕️ Resume done before your coffee cools.
              <Link to="/blog" style={{ marginLeft: '0.75rem', fontSize: '0.875rem' }}>Blog</Link>
              <Link to="/about" style={{ marginLeft: '0.75rem', fontSize: '0.875rem' }}>About</Link>
            </p>
          </div>
          <button
            type="button"
            className={styles.importButton}
            onClick={handleOpenImport}
          >
            Import resume (PDF)
          </button>
        </div>
        <ProgressIndicator
          sections={RESUME_SECTION_ORDER}
          currentSection={flowState.sectionId}
          getLabel={getSectionLabel}
        />
      </header>
      <div className={styles.messagesWrap}>
        <ChatMessages messages={messages} onSelectOption={handleSend} />
        <div ref={messagesEndRef} />
      </div>
      {flowState.sectionId === 'review' && (
        <div className={styles.reviewActions}>
          <button
            type="button"
            className={styles.jdButton}
            onClick={() => {
              const willOpen = !jdPanelOpen
              setJdPanelOpen((o) => !o)
              if (willOpen) analytics.jobDescriptionPanelOpen()
            }}
          >
            {jdPanelOpen ? 'Hide job description tool' : 'Match job description'}
          </button>
        </div>
      )}
      {jdPanelOpen && <JDMatchingPanel onClose={() => setJdPanelOpen(false)} />}
      <ChatInput
        ref={chatInputRef}
        onSend={handleSend}
        onSkip={handleSkip}
        showSkip={flowState.sectionId !== 'review' && !llmLoading}
        disabled={llmLoading}
        placeholder={llmLoading ? 'Thinking…' : 'Type your answer...'}
      />
      {importOpen && (
        <div className={styles.importModalBackdrop}>
          <div className={styles.importModal}>
            <h3 className={styles.importModalTitle}>Import your existing resume (PDF)</h3>
            <form onSubmit={handleImportSubmit}>
              <div className={styles.importModalBody}>
                <p>
                  We&apos;ll read your PDF, extract the text, and do a best-effort fill of your resume
                  inside Fast Resume. You can edit everything afterwards.
                </p>
                <input
                  ref={importFileRef}
                  className={styles.importFileInput}
                  type="file"
                  accept="application/pdf"
                />
                {importStatus !== 'idle' && (
                  <p className={styles.importProgress}>
                    {importStatus === 'reading' && 'Reading file…'}
                    {importStatus === 'uploading' && 'Sending to server and extracting text…'}
                    {importStatus === 'mapping' && 'Mapping into resume structure…'}
                    {importStatus === 'done' && 'Imported! Your resume has been filled. Review and tweak any fields.'}
                  </p>
                )}
                {importError && <p className={styles.importError}>{importError}</p>}
                {importRaw && (
                  <div className={styles.importRawPreview}>
                    {importRaw.slice(0, 2000)}
                    {importRaw.length > 2000 ? '…' : ''}
                  </div>
                )}
              </div>
              <div className={styles.importModalFooter}>
                <button
                  type="button"
                  className={styles.importSecondaryBtn}
                  onClick={handleCloseImport}
                  disabled={
                    importStatus === 'reading' ||
                    importStatus === 'uploading' ||
                    importStatus === 'mapping'
                  }
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={styles.importPrimaryBtn}
                  disabled={
                    importStatus === 'reading' ||
                    importStatus === 'uploading' ||
                    importStatus === 'mapping'
                  }
                >
                  {importStatus === 'done' ? 'Re-import' : 'Import PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
