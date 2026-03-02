import { useState, useCallback } from 'react'
import { useResume } from '../../context/ResumeContext'
import { matchJobDescription } from '../../ai/analysis'
import { getResumeAsPlainText } from '../../utils/resumeToText'
import styles from '../../styles/JDMatchingPanel.module.css'

interface JDMatchingPanelProps {
  onClose: () => void
}

export function JDMatchingPanel({ onClose }: JDMatchingPanelProps) {
  const { resume } = useResume()
  const [jdText, setJdText] = useState('')
  const [result, setResult] = useState<ReturnType<typeof matchJobDescription> | null>(null)

  const analyze = useCallback(() => {
    const resumeText = getResumeAsPlainText(resume)
    const match = matchJobDescription(resumeText, jdText)
    setResult(match)
  }, [resume, jdText])

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2>Job description matching</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className={styles.help}>
          Paste a job description below. We'll highlight keyword gaps and suggest improvements.
        </p>
        <textarea
          className={styles.textarea}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste job description here..."
          rows={6}
        />
        <button type="button" className={styles.analyzeBtn} onClick={analyze} disabled={!jdText.trim()}>
          Analyze match
        </button>
        {result && (
          <div className={styles.result}>
            <h3>Keywords in job description missing from your resume</h3>
            {result.missingInResume.length === 0 ? (
              <p className={styles.good}>Good overlap — no major gaps.</p>
            ) : (
              <ul className={styles.keywordList}>
                {result.missingInResume.slice(0, 30).map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
                {result.missingInResume.length > 30 && (
                  <li>… and {result.missingInResume.length - 30} more</li>
                )}
              </ul>
            )}
            <p className={styles.tip}>Add these where relevant to improve ATS match.</p>
          </div>
        )}
      </div>
    </div>
  )
}
