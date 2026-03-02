import { useResume } from '../../context/ResumeContext'
import type { EducationEntry } from '../../types/resume'
import { EditableField } from './EditableField'
import styles from '../../styles/resume.module.css'

interface ResumeEducationProps {
  entries: EducationEntry[]
}

export function ResumeEducation({ entries }: ResumeEducationProps) {
  const { updateEducation } = useResume()

  if (entries.length === 0) return null
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Education</h2>
      {entries.map((entry) => (
        <div key={entry.id} className={styles.block}>
          <div className={styles.blockHeader}>
            <EditableField
              value={entry.institution}
              placeholder="Institution"
              onChange={(v) => updateEducation(entry.id, { institution: v })}
              className={styles.company}
            />
            <span className={styles.role}> — </span>
            <EditableField
              value={entry.degree}
              placeholder="Degree"
              onChange={(v) => updateEducation(entry.id, { degree: v })}
              className={styles.role}
            />
          </div>
          <p className={styles.dateRange}>
            <EditableField
              value={entry.startYear}
              placeholder="Start year"
              onChange={(v) => updateEducation(entry.id, { startYear: v })}
              className={styles.datePart}
            />
            {' – '}
            <EditableField
              value={entry.endYear}
              placeholder="End year"
              onChange={(v) => updateEducation(entry.id, { endYear: v })}
              className={styles.datePart}
            />
          </p>
        </div>
      ))}
    </section>
  )
}
