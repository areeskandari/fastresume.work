import { useState, useCallback, useRef, useEffect, forwardRef } from 'react'
import styles from '../../styles/ChatInput.module.css'

interface ChatInputProps {
  onSend: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput = forwardRef<HTMLTextAreaElement | null, ChatInputProps>(function ChatInput(
  { onSend, disabled, placeholder = 'Type your answer...' },
  ref
) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const setRefs = useCallback(
    (el: HTMLTextAreaElement | null) => {
      (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
    },
    [ref]
  )

  const send = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        send()
      }
    },
    [send]
  )

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [value])

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={setRefs}
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Chat input"
      />
      <button
        type="button"
        className={styles.sendButton}
        onClick={send}
        disabled={disabled || !value.trim()}
        aria-label="Send"
      >
        Send
      </button>
    </div>
  )
})
