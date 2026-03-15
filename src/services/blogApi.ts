const API_BASE = import.meta.env.VITE_API_URL ?? ''

export interface BlogPostListItem {
  id: string
  slug: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface BlogPost extends BlogPostListItem {
  body: string
}

export async function fetchBlogPosts(): Promise<BlogPostListItem[]> {
  const res = await fetch(`${API_BASE}/api/blog/posts`)
  if (!res.ok) throw new Error('Failed to load posts')
  return res.json()
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API_BASE}/api/blog/posts/${encodeURIComponent(slug)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load post')
  return res.json()
}

export async function createBlogPost(
  data: { slug: string; title: string; description?: string; body?: string },
  cmsSecret: string
): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/blog/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cmsSecret}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create post')
  }
  return res.json()
}

export async function updateBlogPost(
  id: string,
  data: { slug?: string; title?: string; description?: string; body?: string },
  cmsSecret: string
): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/blog/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cmsSecret}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update post')
  }
  return res.json()
}

export async function deleteBlogPost(id: string, cmsSecret: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/blog/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${cmsSecret}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete post')
  }
}
