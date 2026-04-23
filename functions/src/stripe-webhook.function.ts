import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

export const stripeWebhook = onRequest(async (req, res) => {
  const stripeKey = process.env['STRIPE_SECRET_KEY'];
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  if (!stripeKey || !webhookSecret) {
    res.status(500).send('Stripe not configured');
    return;
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch {
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.['bookingId'];
    if (bookingId) {
      await admin.firestore().doc(`bookings/${bookingId}`).update({
        paymentStatus: 'paid',
        status: 'confirmed',
        stripeSessionId: session.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const bookingId = pi.metadata?.['bookingId'];
    if (bookingId) {
      await admin.firestore().doc(`bookings/${bookingId}`).update({
        paymentStatus: 'failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  res.status(200).json({ received: true });
});
