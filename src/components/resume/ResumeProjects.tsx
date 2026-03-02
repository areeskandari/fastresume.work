import { useResume } from '../../context/ResumeContext'
import type { ProjectEntry } from '../../types/resume'
import { EditableField } from './EditableField'
import styles from '../../styles/resume.module.css'

interface ResumeProjectsProps {
  projects: ProjectEntry[]
}

export function ResumeProjects({ projects }: ResumeProjectsProps) {
  const { updateProject } = useResume()

  if (projects.length === 0) return null
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Projects</h2>
      {projects.map((proj) => (
        <div key={proj.id} className={styles.block}>
          <div className={styles.blockHeader}>
            <EditableField
              value={proj.name}
              placeholder="Project name"
              onChange={(v) => updateProject(proj.id, { name: v })}
              className={styles.company}
            />
            <span className={styles.role}> — </span>
            <EditableField
              value={proj.url ?? ''}
              placeholder="URL (optional)"
              onChange={(v) => updateProject(proj.id, { url: v.trim() || undefined })}
              className={styles.role}
            />
          </div>
          <div className={styles.projectDesc}>
            <EditableField
              value={proj.description}
              placeholder="Short description and your role"
              onChange={(v) => updateProject(proj.id, { description: v })}
              multiline
              as="p"
            />
          </div>
          {proj.bullets && proj.bullets.length > 0 && (
            <ul className={styles.bulletList}>
              {(proj.bullets as string[]).map((b, i) => (
                <li key={i}>
                  <EditableField
                    value={b}
                    placeholder="Key result or tech"
                    onChange={(v) => {
                      const next = [...(proj.bullets || [])]
                      next[i] = v
                      updateProject(proj.id, { bullets: next })
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  )
}
