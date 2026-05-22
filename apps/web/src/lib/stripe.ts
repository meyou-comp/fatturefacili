import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-04-22.dahlia' as any,
  appInfo: {
    name: 'Fatture Facili',
    version: '0.1.0',
  },
});
