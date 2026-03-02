mport Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, inputs, session_id: sessionId } = req.body || {};
  if (!resume || !inputs) {
    return res.status(400).json({ error: 'resume and inputs required' });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    return res.status(503).json({ error: 'OpenRouter not configured' });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (stripeSecret && sessionId) {
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-11-20.acacia' });
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(402).json({ error: 'Payment required' });
      }
    } catch {
      return res.status(402).json({ error: 'Invalid session' });
    }
  }

  const resumeText = typeof resume === 'string' ? resume : JSON.stringify(resume, null, 2);
  const {
    companyName = '',
    jobPosition = '',
    basicInterests = '',
    recipientName = '',
    recipientTitle = '',
  } = inputs || {};

  const prompt = `Using the resume JSON and details below, write a tailored professional cover letter.\n\nCompany: ${companyName}\nRole: ${jobPosition}\nInterests: ${basicInterests}\nRecipient name: ${recipientName}\nRecipient title: ${recipientTitle}\n\nResume:\n${resumeText}`;

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
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    res.json({ letter: content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
