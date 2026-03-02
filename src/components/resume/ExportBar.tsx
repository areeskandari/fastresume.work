import { useState } from 'react'
import { useResume } from '../../context/ResumeContext'
import { exportResumeToPdf } from '../../utils/exportPdf'
import { exportResumeToDocx } from '../../utils/exportDocx'
import { getResumeAsPlainText } from '../../utils/resumeToText'
import {
  createEnhanceCheckout,
  createCoverLetterCheckout,
  enhanceResume,
  generateCoverLetter,
  type CoverLetterInputs,
} from '../../services/api'
import { saveAs } from 'file-saver'
import { analytics } from '../../analytics'
import styles from '../../styles/ExportBar.module.css'

interface ExportBarProps {
  enhanceSessionId: string | null
  coverSessionId: string | null
  onEnhanceSessionConsumed?: () => void
}

export function ExportBar({
  enhanceSessionId,
  coverSessionId,
  onEnhanceSessionConsumed,
}: ExportBarProps) {
  const { resume, updateAbout, updateExperience } = useResume()
  const [enhanceLoading, setEnhanceLoading] = useState(false)
  const [enhanceError, setEnhanceError] = useState<string | null>(null)
  const [coverModalOpen, setCoverModalOpen] = useState(false)
  const [coverInputs, setCoverInputs] = useState<CoverLetterInputs>({
    companyName: '',
    jobPosition: '',
    basicInterests: '',
    recipientName: '',
    recipientTitle: '',
  })
  const [coverLoading, setCoverLoading] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState<string | null>(null)

  const handlePdf = () => {
    analytics.exportPdf()
    exportResumeToPdf(resume)
  }

  const handleDocx = async () => {
    analytics.exportDocx()
    await exportResumeToDocx(resume)
  }

  const handleTxt = () => {
    analytics.exportTxt()
    const text = getResumeAsPlainText(resume)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'resume.txt')
  }

  const handleAtsEnhance = async () => {
    setEnhanceError(null)
    if (!enhanceSessionId) {
      analytics.atsEnhanceCheckoutStart()
      setEnhanceLoading(true)
      try {
        const { url } = await createEnhanceCheckout()
        if (url) window.location.href = url
      } catch (e) {
        setEnhanceError(e instanceof Error ? e.message : 'Checkout failed')
      } finally {
        setEnhanceLoading(false)
      }
      return
    }
    setEnhanceLoading(true)
    try {
      const { enhanced } = await enhanceResume(resume, enhanceSessionId)
      if (enhanced.professionalSummary) {
        updateAbout({ professionalSummary: enhanced.professionalSummary })
      }
      if (enhanced.experience?.length && resume.experience.length >= enhanced.experience.length) {
        enhanced.experience.forEach((entry, i) => {
          if (entry.bullets?.length && resume.experience[i]) {
            updateExperience(resume.experience[i].id, { bullets: entry.bullets })
          }
        })
      }
      onEnhanceSessionConsumed?.()
      analytics.atsEnhanceApplied()
    } catch (e) {
      setEnhanceError(e instanceof Error ? e.message : 'Enhance failed')
    } finally {
      setEnhanceLoading(false)
    }
  }

  const apiBase = import.meta.env.VITE_API_URL ?? ''
  const showEnhance = !!apiBase || import.meta.env.DEV

  const handleOpenCover = async () => {
    setCoverError(null)
    setCoverLetter(null)
    if (!coverSessionId) {
      analytics.coverLetterCheckoutStart()
      try {
        setCoverLoading(true)
        const { url } = await createCoverLetterCheckout()
        if (url) window.location.href = url
      } catch (e) {
        setCoverError(e instanceof Error ? e.message : 'Checkout failed')
      } finally {
        setCoverLoading(false)
      }
      return
    }
    analytics.coverLetterModalOpen()
    setCoverModalOpen(true)
  }

  const handleGenerateCover = async () => {
    setCoverError(null)
    if (!coverInputs.companyName || !coverInputs.jobPosition || !coverInputs.basicInterests) {
      setCoverError('Please fill in all required fields.')
      return
    }
    try {
      setCoverLoading(true)
      const { letter } = await generateCoverLetter(resume, coverInputs, coverSessionId || undefined)
      setCoverLetter(letter)
      analytics.coverLetterGenerated()
    } catch (e) {
      setCoverError(e instanceof Error ? e.message : 'Failed to generate cover letter')
    } finally {
      setCoverLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {showEnhance && (
        <button
          type="button"
          className={styles.enhanceBtn}
          onClick={handleAtsEnhance}
          disabled={enhanceLoading}
        >
          {enhanceLoading ? '…' : enhanceSessionId ? 'ATS Enhance (apply)' : 'ATS Enhance — $0.99'}
        </button>
      )}
      {showEnhance && (
        <button
          type="button"
          className={styles.coverLetterBtn}
          onClick={handleOpenCover}
          disabled={coverLoading}
        >
          {coverLoading ? '…' : 'Write cover letter — $0.50'}
        </button>
      )}
      {(enhanceError || coverError) && (
        <span className={styles.enhanceError}>{enhanceError || coverError}</span>
      )}
      <span className={styles.label}>Export:</span>
      <button type="button" className={styles.btn} onClick={handlePdf}>
        PDF
      </button>
      <button type="button" className={styles.btn} onClick={handleDocx}>
        DOCX
      </button>
      <button type="button" className={styles.btn} onClick={handleTxt}>
        Text
      </button>
      {coverModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Write cover letter — Fast Resume</h3>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>
                Company name *
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={coverInputs.companyName}
                  onChange={(e) =>
                    setCoverInputs((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                />
              </label>
              <label className={styles.fieldLabel}>
                Job position you want to apply *
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={coverInputs.jobPosition}
                  onChange={(e) =>
                    setCoverInputs((prev) => ({ ...prev, jobPosition: e.target.value }))
                  }
                />
              </label>
              <label className={styles.fieldLabel}>
                Your basic interests (why this role/company) *
                <textarea
                  className={styles.fieldTextarea}
                  rows={3}
                  value={coverInputs.basicInterests}
                  onChange={(e) =>
                    setCoverInputs((prev) => ({ ...prev, basicInterests: e.target.value }))
                  }
                />
              </label>
              <label className={styles.fieldLabel}>
                Recipient’s name (optional)
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={coverInputs.recipientName ?? ''}
                  onChange={(e) =>
                    setCoverInputs((prev) => ({ ...prev, recipientName: e.target.value }))
                  }
                />
              </label>
              <label className={styles.fieldLabel}>
                Recipient’s professional title (optional)
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={coverInputs.recipientTitle ?? ''}
                  onChange={(e) =>
                    setCoverInputs((prev) => ({ ...prev, recipientTitle: e.target.value }))
                  }
                />
              </label>
              {coverLetter && (
                <div className={styles.coverOutput}>
                  <h4 className={styles.coverOutputTitle}>Generated cover letter</h4>
                  <pre className={styles.coverOutputBody}>{coverLetter}</pre>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setCoverModalOpen(false)}
                disabled={coverLoading}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.coverLetterBtn}
                onClick={handleGenerateCover}
                disabled={coverLoading}
              >
                {coverLoading ? 'Generating…' : 'Pay & create cover letter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
