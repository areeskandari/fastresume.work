import type { ResumeSectionId } from '../../types/resume'
import styles from '../../styles/ProgressIndicator.module.css'

interface ProgressIndicatorProps {
  sections: ResumeSectionId[]
  currentSection: ResumeSectionId
  getLabel: (id: ResumeSectionId) => string
}

export function ProgressIndicator({ sections, currentSection, getLabel }: ProgressIndicatorProps) {
  const currentIndex = sections.indexOf(currentSection)
  return (
    <nav className={styles.wrapper} aria-label="Resume sections progress">
      <ol className={styles.list}>
        {sections.map((id, i) => {
          const isActive = id === currentSection
          const isDone = i < currentIndex
          return (
            <li
              key={id}
              className={`${styles.item} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
            >
              <span className={styles.dot} />
              <span className={styles.label}>{getLabel(id)}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
