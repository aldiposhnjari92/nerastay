import { onCall, HttpsError } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

function getStripe(): Stripe {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) throw new HttpsError('internal', 'Stripe not configured');
  return new Stripe(key, { apiVersion: '2024-04-10' });
}

interface CheckoutRequest {
  bookingId: string;
  listingName: string;
  total: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = onCall<CheckoutRequest>(
  { cors: true },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Must be signed in');
    const { bookingId, listingName, total, currency, successUrl, cancelUrl } = req.data;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: listingName, metadata: { bookingId } },
          unit_amount: Math.round(total * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { bookingId, uid: req.auth.uid }
    });

    return { sessionId: session.id, url: session.url };
  }
);
