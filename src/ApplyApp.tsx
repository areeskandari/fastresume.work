import { useEffect, useState } from 'react'
import { ResumeProvider } from './context/ResumeContext'
import { ApplyAssistant } from './components/ApplyAssistant'
import { ResumePreview } from './components/ResumePreview'
import { verifyEnhanceSession } from './services/api'
import styles from './styles/ApplyApp.module.css'

export function ApplyApp() {
  const [enhanceSessionId, setEnhanceSessionId] = useState<string | null>(null)
  const [coverSessionId, setCoverSessionId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('session_id')
    const enhance = params.get('enhance') === '1'
    const cover = params.get('cover') === '1'
    if (sid && (enhance || cover)) {
      verifyEnhanceSession(sid)
        .then(({ paid }) => {
          if (paid) {
            if (enhance) setEnhanceSessionId(sid)
            if (cover) setCoverSessionId(sid)
            try {
              window.history.replaceState({}, '', window.location.pathname)
            } catch {}
          }
        })
        .catch(() => {})
    }
  }, [])

  return (
    <ResumeProvider>
      <div className={styles.layout}>
        <aside className={styles.chatColumn}>
          <ApplyAssistant />
        </aside>
        <main className={styles.previewColumn}>
          <ResumePreview
            enhanceSessionId={enhanceSessionId}
            coverSessionId={coverSessionId}
            onEnhanceSessionConsumed={() => setEnhanceSessionId(null)}
          />
        </main>
      </div>
    </ResumeProvider>
  )
}
