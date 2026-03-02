import { useResume } from '../../context/ResumeContext'
import type { About } from '../../types/resume'
import { EditableField } from './EditableField'
import styles from '../../styles/resume.module.css'

interface ResumeHeaderProps {
  about: About
}

export function ResumeHeader({ about }: ResumeHeaderProps) {
  const { updateAbout } = useResume()
  const contact = about.contact

  const parts: { key: keyof NonNullable<About['contact']>; text: string; isLink?: boolean }[] = []
  if (contact.location != null) parts.push({ key: 'location', text: contact.location })
  if (contact.email != null) parts.push({ key: 'email', text: contact.email, isLink: true })
  if (contact.phone != null) parts.push({ key: 'phone', text: contact.phone })
  if (contact.linkedin != null) parts.push({ key: 'linkedin', text: contact.linkedin, isLink: true })
  if (contact.portfolio != null) parts.push({ key: 'portfolio', text: contact.portfolio, isLink: true })

  const updateContact = (field: keyof NonNullable<About['contact']>, value: string) => {
    updateAbout({ contact: { ...contact, [field]: value || undefined } })
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.name}>
        <EditableField
          value={about.fullName}
          placeholder="Your full name"
          onChange={(v) => updateAbout({ fullName: v })}
          className={styles.nameEdit}
        />
      </h1>
      {parts.length > 0 ? (
        <p className={styles.contact}>
          {parts.map((p, i) => (
            <span key={p.key}>
              {i > 0 && ' | '}
              <EditableField
                value={p.text}
                placeholder={
                  p.key === 'email'
                    ? 'email@example.com'
                    : p.key === 'linkedin'
                      ? 'linkedin.com/in/you'
                      : p.key === 'portfolio'
                        ? 'yoursite.com'
                        : p.key
                }
                onChange={(v) => updateContact(p.key as keyof NonNullable<About['contact']>, v)}
                className={p.isLink ? styles.contactLink : undefined}
              />
            </span>
          ))}
        </p>
      ) : null}
    </header>
  )
}
