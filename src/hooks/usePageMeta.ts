import { useEffect } from 'react'

const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://fastresume.work')

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta(options: {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
}) {
  const { title, description, canonical, ogImage } = options

  useEffect(() => {
    const fullTitle = title ? `${title} — Fast Resume` : 'Fast Resume'
    document.title = fullTitle
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, true)
      setMeta('twitter:description', description)
    }
    setMeta('og:title', fullTitle, true)
    setMeta('twitter:title', fullTitle)
    if (canonical) {
      setMeta('og:url', canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`, true)
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`
    }
    if (ogImage) {
      const url = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`
      setMeta('og:image', url, true)
      setMeta('twitter:image', url)
    }
    return () => {
      document.title = 'Fast Resume — Resume done before your coffee cools.'
    }
  }, [title, description, canonical, ogImage])
}
