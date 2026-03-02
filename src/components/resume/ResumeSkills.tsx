import { useResume } from '../../context/ResumeContext'
import type { Skills } from '../../types/resume'
import { EditableField } from './EditableField'
import styles from '../../styles/resume.module.css'

interface ResumeSkillsProps {
  skills: Skills
}

function joinSkills(arr: string[]): string {
  return arr.join(', ')
}
function parseSkills(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export function ResumeSkills({ skills }: ResumeSkillsProps) {
  const { updateSkills } = useResume()
  const hasAny =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.soft.length > 0

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Skills</h2>
      <div className={styles.skillsBlock}>
        <p>
          <strong>Technical:</strong>{' '}
          <EditableField
            value={joinSkills(skills.technical)}
            placeholder="e.g. JavaScript, Python, SQL"
            onChange={(v) => updateSkills({ technical: parseSkills(v) })}
          />
        </p>
        <p>
          <strong>Tools:</strong>{' '}
          <EditableField
            value={joinSkills(skills.tools)}
            placeholder="e.g. Figma, AWS, Jira"
            onChange={(v) => updateSkills({ tools: parseSkills(v) })}
          />
        </p>
        <p>
          <strong>Soft:</strong>{' '}
          <EditableField
            value={joinSkills(skills.soft)}
            placeholder="e.g. Leadership, Communication"
            onChange={(v) => updateSkills({ soft: parseSkills(v) })}
          />
        </p>
      </div>
    </section>
  )
}
