import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import pdf from 'pdf-parse'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const promptsPath = path.join(__dirname, '..', 'src', 'prompts', 'system-prompts.json')
const systemPrompts = fs.existsSync(promptsPath)
  ? JSON.parse(fs.readFileSync(promptsPath, 'utf8'))
  : { enhance: { userPrompt: '' } }

const app = express()
const port = process.env.PORT || 3001

const stripeSecret = process.env.STRIPE_SECRET_KEY
const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY

if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY not set; payment endpoints will fail')
}

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-11-20.acacia' }) : null

app.use(cors({ origin: true }))
app.use(express.json({ limit: '5mb' }))

const baseUrl = process.env.BASE_URL || 'http://localhost:5173'

app.post('/api/create-enhance-checkout', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' })
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ATS Resume Enhance',
              description: 'One-time AI-powered resume enhancement for ATS optimization',
            },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}&enhance=1`,
      cancel_url: `${baseUrl}/`,
    })
    res.json({ url: session.url })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/create-cover-letter-checkout', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' })
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Cover Letter',
              description: 'One-time AI-generated cover letter based on your resume',
            },
            unit_amount: 50,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}&cover=1`,
      cancel_url: `${baseUrl}/`,
    })
    res.json({ url: session.url })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/verify-session', async (req, res) => {
  const sessionId = req.query.session_id
  if (!sessionId || !stripe) {
    return res.json({ paid: false })
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    res.json({ paid: session.payment_status === 'paid' })
  } catch {
    res.json({ paid: false })
  }
})

app.post('/api/enhance', async (req, res) => {
  const { resume, session_id: sessionId } = req.body || {}
  if (!resume) {
    return res.status(400).json({ error: 'resume required' })
  }
  if (!openRouterKey) {
    return res.status(503).json({ error: 'OpenRouter not configured' })
  }
  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status !== 'paid') {
        return res.status(402).json({ error: 'Payment required' })
      }
    } catch {
      return res.status(402).json({ error: 'Invalid session' })
    }
  }

  const resumeText = typeof resume === 'string' ? resume : JSON.stringify(resume, null, 2)
  const promptTemplate = systemPrompts.enhance?.userPrompt || 'Improve this resume for ATS. Return JSON with keys: professionalSummary, experience (array of { bullets }). Resume:\n\n{{resumeText}}'
  const prompt = promptTemplate.replace('{{resumeText}}', resumeText)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(err)
    }
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim() || '{}'
    let parsed = {}
    try {
      const cleaned = content.replace(/^```\w*\n?|\n?```$/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { professionalSummary: content }
    }
    res.json({ enhanced: parsed })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/cover-letter', async (req, res) => {
  const { resume, inputs, session_id: sessionId } = req.body || {}
  if (!resume || !inputs) {
    return res.status(400).json({ error: 'resume and inputs required' })
  }
  if (!openRouterKey) {
    return res.status(503).json({ error: 'OpenRouter not configured' })
  }
  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status !== 'paid') {
        return res.status(402).json({ error: 'Payment required' })
      }
    } catch {
      return res.status(402).json({ error: 'Invalid session' })
    }
  }

  const resumeText = typeof resume === 'string' ? resume : JSON.stringify(resume, null, 2)
  const {
    companyName = '',
    jobPosition = '',
    basicInterests = '',
    recipientName = '',
    recipientTitle = '',
  } = inputs || {}

  const promptTemplate =
    systemPrompts.coverLetter?.userPrompt ||
    'Using the resume JSON and details below, write a tailored professional cover letter.\n\nCompany: {{companyName}}\nRole: {{jobPosition}}\nInterests: {{basicInterests}}\nRecipient name: {{recipientName}}\nRecipient title: {{recipientTitle}}\n\nResume:\n{{resumeText}}'

  const prompt = promptTemplate
    .replace('{{companyName}}', companyName)
    .replace('{{jobPosition}}', jobPosition)
    .replace('{{basicInterests}}', basicInterests)
    .replace('{{recipientName}}', recipientName)
    .replace('{{recipientTitle}}', recipientTitle)
    .replace('{{resumeText}}', resumeText)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(err)
    }
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim() || ''
    res.json({ letter: content })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// ——— Import resume (PDF → raw text only) ———
app.post('/api/import-resume-text', async (req, res) => {
  try {
    const { data } = req.body || {}
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'data (base64) required' })
    }
    const buffer = Buffer.from(data, 'base64')
    const result = await pdf(buffer)
    const text = (result.text || '').trim()
    if (!text) {
      return res.status(422).json({ error: 'Could not extract text from PDF' })
    }
    res.json({ text })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to read PDF' })
  }
})

// ——— Blog (simple CMS) ———
const dataDir = path.join(__dirname, 'data')
const postsPath = path.join(dataDir, 'posts.json')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(postsPath)) fs.writeFileSync(postsPath, '[]', 'utf8')
}

function readPosts() {
  ensureDataDir()
  const raw = fs.readFileSync(postsPath, 'utf8')
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writePosts(posts) {
  ensureDataDir()
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8')
}

const cmsSecret = process.env.CMS_SECRET || ''

function requireCmsAuth(req, res, next) {
  if (!cmsSecret) {
    return res.status(503).json({ error: 'CMS not configured (set CMS_SECRET)' })
  }
  const auth = req.headers.authorization || req.headers['x-cms-secret'] || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim() || (typeof auth === 'string' ? auth : '')
  if (token !== cmsSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.get('/api/blog/posts', (_req, res) => {
  const posts = readPosts()
  const list = posts
    .map(({ id, slug, title, description, createdAt, updatedAt }) => ({
      id,
      slug,
      title,
      description,
      createdAt,
      updatedAt,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json(list)
})

app.get('/api/blog/posts/:slug', (req, res) => {
  const posts = readPosts()
  const post = posts.find((p) => p.slug === req.params.slug)
  if (!post) return res.status(404).json({ error: 'Not found' })
  res.json(post)
})

app.post('/api/blog/posts', requireCmsAuth, express.json(), (req, res) => {
  const { slug, title, description, body } = req.body || {}
  if (!slug || !title) {
    return res.status(400).json({ error: 'slug and title required' })
  }
  const posts = readPosts()
  if (posts.some((p) => p.slug === slug)) {
    return res.status(409).json({ error: 'Slug already exists' })
  }
  const now = new Date().toISOString()
  const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const post = {
    id,
    slug: slug.trim(),
    title: (title || '').trim(),
    description: (description || '').trim(),
    body: (body || '').trim(),
    createdAt: now,
    updatedAt: now,
  }
  posts.push(post)
  writePosts(posts)
  res.status(201).json(post)
})

app.put('/api/blog/posts/:id', requireCmsAuth, express.json(), (req, res) => {
  const posts = readPosts()
  const idx = posts.findIndex((p) => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const { slug, title, description, body } = req.body || {}
  const current = posts[idx]
  const newSlug = slug !== undefined ? slug.trim() : current.slug
  if (newSlug && posts.some((p, i) => i !== idx && p.slug === newSlug)) {
    return res.status(409).json({ error: 'Slug already exists' })
  }
  const now = new Date().toISOString()
  posts[idx] = {
    ...current,
    slug: newSlug || current.slug,
    title: title !== undefined ? title.trim() : current.title,
    description: description !== undefined ? description.trim() : current.description,
    body: body !== undefined ? body.trim() : current.body,
    updatedAt: now,
  }
  writePosts(posts)
  res.json(posts[idx])
})

app.delete('/api/blog/posts/:id', requireCmsAuth, (req, res) => {
  const posts = readPosts()
  const idx = posts.findIndex((p) => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  posts.splice(idx, 1)
  writePosts(posts)
  res.status(204).send()
})

app.listen(port, () => {
  console.log(`Apply API running on http://localhost:${port}`)
})
