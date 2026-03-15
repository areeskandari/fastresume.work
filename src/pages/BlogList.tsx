import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBlogPosts } from '../services/blogApi'
import type { BlogPostListItem } from '../services/blogApi'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from '../styles/Blog.module.css'

export function BlogList() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  usePageMeta({
    title: 'Blog',
    description: 'Tips and insights on resumes, ATS, and job applications from Fast Resume.',
    canonical: '/blog',
  })

  useEffect(() => {
    fetchBlogPosts()
      .then(setPosts)
      .catch(() => setError('Could not load posts.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <h1 className={styles.blogListTitle}>Blog</h1>
      {loading && <p style={{ color: 'var(--col-text-muted)' }}>Loading…</p>}
      {error && <p className={styles.cmsError}>{error}</p>}
      {!loading && !error && (
        <ul className={styles.blogList}>
          {posts.length === 0 && (
            <li style={{ color: 'var(--col-text-muted)' }}>No posts yet.</li>
          )}
          {posts.map((post) => (
            <li key={post.id} className={styles.blogListItem}>
              <Link to={`/blog/${post.slug}`} className={styles.blogItemLink}>
                {post.title}
              </Link>
              {post.description && (
                <p className={styles.blogItemDesc}>{post.description}</p>
              )}
              <time className={styles.blogItemDate} dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
