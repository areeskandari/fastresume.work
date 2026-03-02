import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
    }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
          return res.status(503).json({ error: 'Stripe not configured' });
    }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-11-20.acacia' });
    const baseUrl = process.env.BASE_URL || 'https://fastresume.work';

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
        });
        res.json({ url: session.url });
  } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
  }
}
