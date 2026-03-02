import type { ChatMessage as ChatMessageType } from '../../ai/types'
import styles from '../../styles/ChatMessages.module.css'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  onSelectOption?: (value: string) => void
}

const isPreChat = (messages: ChatMessageType[]) =>
  messages.length === 1 && messages[0].role === 'assistant'

const ATS_TIP_MARKER = 'ATS tip:'

function splitMainAndReason(content: string): { main: string; reason: string | null } {
  const idx = content.indexOf(ATS_TIP_MARKER)
  if (idx === -1) return { main: content.trim(), reason: null }
  const main = content.slice(0, idx).trim()
  const reason = content.slice(idx + ATS_TIP_MARKER.length).trim()
  return { main, reason: reason || null }
}

function MessageBubble({
  msg,
  isLastAssistant,
  onSelectOption,
}: {
  msg: ChatMessageType
  isLastAssistant: boolean
  onSelectOption?: (value: string) => void
}) {
  const isUser = msg.role === 'user'
  const { main, reason } = !isUser ? splitMainAndReason(msg.content) : { main: msg.content, reason: null }
  const showOptions = !isUser && isLastAssistant && msg.options && msg.options.length > 0 && onSelectOption
  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.content}>{main}</div>
      {!isUser && reason && <div className={styles.atsTip}>{reason}</div>}
      {showOptions && (
        <div className={styles.optionChips}>
          {msg.options!.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={styles.optionChip}
              onClick={() => onSelectOption(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {!isUser && msg.hint && <div className={styles.hint}>{msg.hint}</div>}
      {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>Suggestions:</span>
          <ul>
            {msg.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {!isUser && msg.clarification && (
        <div className={styles.clarification}>{msg.clarification}</div>
      )}
    </div>
  )
}

export function ChatMessages({ messages, onSelectOption }: ChatMessagesProps) {
  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id
  const showWelcome = isPreChat(messages)

  return (
    <div className={styles.wrapper}>
      {showWelcome && (
        <div className={styles.welcome}>
          <div className={styles.welcomeImageWrap}>
            <img
              src="/chat-welcome.svg"
              alt=""
              className={styles.welcomeImage}
            />
          </div>
          <div className={styles.welcomeGuide}>
            <h2 className={styles.welcomeTitle}>Welcome to Fast Resume</h2>
            <p className={styles.welcomeIntro}>
              Your AI resume coach will guide you step by step. Here’s how it works:
            </p>
            <ul className={styles.welcomeList}>
              <li><strong>Answer the questions</strong> in the chat — we’ll fill your resume on the right as you go.</li>
              <li><strong>Edit anytime</strong> — hover and click any field on the resume to change it directly.</li>
              <li><strong>Follow the flow</strong> — About → Experience → Education → Skills → Projects, then export or match a job description.</li>
              <li><strong>Export</strong> — download your resume as PDF, DOCX, or Text from the bar below the preview.</li>
              <li><strong>Cover letter</strong> — after paying once, generate a tailored cover letter for any role.</li>
            </ul>
            <p className={styles.welcomeCta}>Type your answer below to get started.</p>
          </div>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isLastAssistant={msg.id === lastAssistantId}
          onSelectOption={onSelectOption}
        />
      ))}
    </div>
  )
}
