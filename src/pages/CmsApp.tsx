import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../services/blogApi'
import type { BlogPostListItem, BlogPost } from '../services/blogApi'
import styles from '../styles/Blog.module.css'

const CMS_SECRET_KEY = 'cmsSecret'

export function CmsApp() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [secret, setSecret] = useState(() => localStorage.getItem(CMS_SECRET_KEY) || '')
  const [authenticated, setAuthenticated] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ slug: '', title: '', description: '', body: '' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadPosts = () => {
    const apiBase = import.meta.env.VITE_API_URL ?? ''
    fetch(`${apiBase}/api/blog/posts`)
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setError('Could not load posts.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!authenticated) {
      setLoading(false)
      return
    }
    setLoading(true)
    loadPosts()
  }, [authenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!secret.trim()) return
    localStorage.setItem(CMS_SECRET_KEY, secret.trim())
    setAuthenticated(true)
    setLoading(true)
    loadPosts()
  }

  const handleLogout = () => {
    localStorage.removeItem(CMS_SECRET_KEY)
    setSecret('')
    setAuthenticated(false)
  }

  const startNew = () => {
    setEditingId(null)
    setForm({ slug: '', title: '', description: '', body: '' })
    setError(null)
  }

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setForm({
      slug: post.slug,
      title: post.title,
      description: post.description || '',
      body: post.body || '',
    })
    setError(null)
  }

  const loadPostForEdit = (postSlug: string) => {
    const apiBase = import.meta.env.VITE_API_URL ?? ''
    fetch(`${apiBase}/api/blog/posts/${encodeURIComponent(postSlug)}`)
      .then((r) => r.json())
      .then((post: BlogPost) => startEdit(post))
      .catch(() => setError('Could not load post.'))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!secret.trim() || !form.slug.trim() || !form.title.trim()) {
      setError('Slug and title are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        await updateBlogPost(
          editingId,
          {
            slug: form.slug,
            title: form.title,
            description: form.description,
            body: form.body,
          },
          secret
        )
      } else {
        await createBlogPost(
          {
            slug: form.slug,
            title: form.title,
            description: form.description,
            body: form.body,
          },
          secret
        )
      }
      startNew()
      loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    setError(null)
    try {
      await deleteBlogPost(id, secret)
      if (editingId === id) startNew()
      loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  if (!authenticated) {
    return (
      <div className={styles.cmsLayout}>
        <div className={styles.cmsLogin}>
          <h2 className={styles.cmsTitle}>CMS Login</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--col-text-muted)', marginBottom: '1rem' }}>
            Set <code>CMS_SECRET</code> on your server; enter the same value below.
          </p>
          <form onSubmit={handleLogin}>
            <label htmlFor="cms-secret">Secret</label>
            <input
              id="cms-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="CMS_SECRET"
              autoComplete="off"
            />
            <button type="submit" className={styles.cmsBtn + ' ' + styles.cmsBtnPrimary}>
              Log in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.cmsLayout}>
      <header className={styles.cmsHeader}>
        <h1 className={styles.cmsTitle}>Blog CMS</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/blog" style={{ fontSize: '0.9375rem' }}>
            View blog
          </Link>
          <button type="button" className={styles.cmsBtn} onClick={startNew}>
            New post
          </button>
          <button type="button" className={styles.cmsBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <form className={styles.cmsForm} onSubmit={handleSave}>
        <div className={styles.cmsFormGroup}>
          <label htmlFor="slug">Slug (URL path, e.g. my-first-post)</label>
          <input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="my-first-post"
            required
          />
        </div>
        <div className={styles.cmsFormGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Post title"
            required
          />
        </div>
        <div className={styles.cmsFormGroup}>
          <label htmlFor="description">Description (SEO / listing)</label>
          <input
            id="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
          />
        </div>
        <div className={styles.cmsFormGroup}>
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Post content (plain text)"
          />
        </div>
        {error && <p className={styles.cmsError}>{error}</p>}
        <div className={styles.cmsActions}>
          <button type="submit" className={styles.cmsBtn + ' ' + styles.cmsBtnPrimary} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className={styles.cmsBtn} onClick={startNew}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className={styles.cmsList} style={{ marginTop: '1.5rem' }}>
        {loading && <li style={{ color: 'var(--col-text-muted)' }}>Loading…</li>}
        {!loading && posts.map((post) => (
          <li key={post.id} className={styles.cmsListItem}>
            <div>
              <Link to={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                {post.title}
              </Link>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.8125rem', color: 'var(--col-text-muted)' }}>
                /{post.slug}
              </span>
            </div>
            <div className={styles.cmsListItemActions}>
              <button
                type="button"
                className={styles.cmsBtn}
                onClick={() => loadPostForEdit(post.slug)}
              >
                Edit
              </button>
              <button
                type="button"
                className={styles.cmsBtn}
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
