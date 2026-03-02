import { useResume } from '../context/ResumeContext'
import { ResumeHeader } from './resume/ResumeHeader'
import { ResumeSummary } from './resume/ResumeSummary'
import { ResumeExperience } from './resume/ResumeExperience'
import { ResumeEducation } from './resume/ResumeEducation'
import { ResumeSkills } from './resume/ResumeSkills'
import { ResumeProjects } from './resume/ResumeProjects'
import { ExportBar } from './resume/ExportBar'
import styles from '../styles/ResumePreview.module.css'

interface ResumePreviewProps {
  enhanceSessionId?: string | null
  coverSessionId?: string | null
  onEnhanceSessionConsumed?: () => void
}

export function ResumePreview({
  enhanceSessionId,
  coverSessionId,
  onEnhanceSessionConsumed,
}: ResumePreviewProps) {
  const { resume } = useResume()

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.sticky} resume-preview-root`}>
        <div className={styles.paper}>
          <ResumeHeader about={resume.about} />
          <ResumeSummary summary={resume.about.professionalSummary} />
          <ResumeExperience entries={resume.experience} />
          <ResumeEducation entries={resume.education} />
          <ResumeSkills skills={resume.skills} />
          <ResumeProjects projects={resume.projects} />
        </div>
        <ExportBar
          enhanceSessionId={enhanceSessionId ?? null}
          coverSessionId={coverSessionId ?? null}
          onEnhanceSessionConsumed={onEnhanceSessionConsumed}
        />
      </div>
    </div>
  )
}
