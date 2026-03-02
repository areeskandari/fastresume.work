import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'

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
app.use(express.json())

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

app.listen(port, () => {
  console.log(`Apply API running on http://localhost:${port}`)
})
