import { useState, useRef, useEffect } from 'react'
import styles from '../../styles/resume.module.css'

interface EditableFieldProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  className?: string
  multiline?: boolean
  as?: 'span' | 'p'
}

export function EditableField({
  value,
  placeholder = 'Click to edit',
  onChange,
  className = '',
  multiline = false,
  as: Tag = 'span',
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const save = () => {
    setEditing(false)
    const trimmed = local.trim()
    if (trimmed !== value) onChange(trimmed)
    else setLocal(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      save()
    }
    if (e.key === 'Escape') {
      setLocal(value)
      setEditing(false)
      inputRef.current?.blur()
    }
  }

  if (editing) {
    const common = {
      ref: inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>,
      value: local,
      onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
        setLocal(e.target.value),
      onBlur: save,
      onKeyDown: handleKeyDown,
      className: styles.editableInput,
    }
    if (multiline) {
      return (
        <textarea
          {...common}
          rows={4}
          className={`${styles.editableInput} ${styles.editableTextarea} ${className}`}
        />
      )
    }
    return <input type="text" {...common} className={`${styles.editableInput} ${className}`} />
  }

  const display = value.trim() || placeholder
  const isPlaceholder = !value.trim()

  return (
    <Tag
      role="button"
      tabIndex={0}
      className={`${styles.editableSpan} ${isPlaceholder ? styles.editablePlaceholder : ''} ${className}`}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setEditing(true)
        }
      }}
      title="Click to edit"
    >
      {display}
    </Tag>
  )
}
