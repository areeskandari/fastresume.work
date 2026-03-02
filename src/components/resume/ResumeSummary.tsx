import { useResume } from '../../context/ResumeContext'
import { EditableField } from './EditableField'
import styles from '../../styles/resume.module.css'

interface ResumeSummaryProps {
  summary: string
}

export function ResumeSummary({ summary }: ResumeSummaryProps) {
  const { updateAbout } = useResume()
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Professional Summary</h2>
      <div className={styles.summary}>
        <EditableField
          value={summary}
          placeholder="Write 3–4 sentences about your experience and key skills..."
          onChange={(v) => updateAbout({ professionalSummary: v })}
          multiline
          as="p"
        />
      </div>
    </section>
  )
}
