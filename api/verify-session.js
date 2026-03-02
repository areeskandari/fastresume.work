import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
    }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const sessionId = req.query.session_id;

  if (!sessionId || !stripeSecret) {
        return res.json({ paid: false });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-11-20.acacia' });

  try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json({ paid: session.payment_status === 'paid' });
  } catch {
        res.json({ paid: false });
  }
}
