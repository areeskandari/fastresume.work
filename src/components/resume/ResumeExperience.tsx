import { useResume } from '../../context/ResumeContext'
import type { ExperienceEntry } from '../../types/resume'
import { EditableField } from './EditableField'
import styles from '../../styles/resume.module.css'

interface ResumeExperienceProps {
  entries: ExperienceEntry[]
}

function formatDateRange(e: ExperienceEntry): string {
  const start = [e.startMonth, e.startYear].filter(Boolean).join(' ')
  const end = e.isCurrent ? 'Present' : [e.endMonth, e.endYear].filter(Boolean).join(' ')
  if (!start && !end) return ''
  return `${start} – ${end}`
}

export function ResumeExperience({ entries }: ResumeExperienceProps) {
  const { updateExperience } = useResume()

  if (entries.length === 0) return null
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Work Experience</h2>
      {entries.map((entry) => (
        <div key={entry.id} className={styles.block}>
          <div className={styles.blockHeader}>
            <EditableField
              value={entry.company}
              placeholder="Company name"
              onChange={(v) => updateExperience(entry.id, { company: v })}
              className={styles.company}
            />
            <span className={styles.role}> — </span>
            <EditableField
              value={entry.role}
              placeholder="Job title"
              onChange={(v) => updateExperience(entry.id, { role: v })}
              className={styles.role}
            />
          </div>
          <p className={styles.dateRange}>
            <EditableField
              value={entry.startMonth}
              placeholder="Mon"
              onChange={(v) => updateExperience(entry.id, { startMonth: v })}
              className={styles.datePart}
            />{' '}
            <EditableField
              value={entry.startYear}
              placeholder="Year"
              onChange={(v) => updateExperience(entry.id, { startYear: v })}
              className={styles.datePart}
            />
            {' – '}
            {entry.isCurrent ? (
              'Present'
            ) : (
              <>
                <EditableField
                  value={entry.endMonth}
                  placeholder="Mon"
                  onChange={(v) => updateExperience(entry.id, { endMonth: v })}
                  className={styles.datePart}
                />{' '}
                <EditableField
                  value={entry.endYear}
                  placeholder="Year"
                  onChange={(v) => updateExperience(entry.id, { endYear: v })}
                  className={styles.datePart}
                />
              </>
            )}
          </p>
          <ul className={styles.bulletList}>
            {entry.bullets.map((b, i) => (
              <li key={i}>
                <EditableField
                  value={b}
                  placeholder="Achievement or responsibility"
                  onChange={(v) => {
                    const next = [...entry.bullets]
                    next[i] = v
                    updateExperience(entry.id, { bullets: next })
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
