import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchBlogPost } from '../services/blogApi'
import type { BlogPost } from '../services/blogApi'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from '../styles/Blog.module.css'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  usePageMeta({
    title: post?.title ?? (slug || 'Post'),
    description: post?.description ?? undefined,
    canonical: `/blog/${slug || ''}`,
  })

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    fetchBlogPost(slug)
      .then(setPost)
      .catch(() => setError('Could not load post.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (!slug) return null

  return (
    <>
      <Link to="/blog" className={styles.backLink}>
        ← Back to Blog
      </Link>
      {loading && <p style={{ color: 'var(--col-text-muted)' }}>Loading…</p>}
      {error && <p className={styles.cmsError}>{error}</p>}
      {!loading && !error && post && (
        <article className={styles.blogArticle}>
          <h1>{post.title}</h1>
          <p className={styles.blogPostMeta}>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
          <div className={styles.blogPostBody}>{post.body || ''}</div>
        </article>
      )}
      {!loading && !error && !post && (
        <p>
          Post not found. <Link to="/blog">Back to Blog</Link>
        </p>
      )}
    </>
  )
}
