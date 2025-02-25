import Stripe from 'stripe';

// Initialize Stripe with the API key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
});
