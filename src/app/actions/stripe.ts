'use server'

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

// Lazy initialization - only create Stripe when actually called
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to your environment variables.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-07-29.dahlia',
  });
}

export async function createCheckoutSession() {
  const stripe = getStripe();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to buy the Black Card.");

  const headersList = await headers();
  const origin = headersList.get('origin');

  // Create the Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Softbare Black Card',
            description: 'Expand your Vault to 50 S-Tier looks. Unlock premium analytics.',
          },
          unit_amount: 499, // $4.99 in cents
          recurring: { interval: 'month' }
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    client_reference_id: user.id, // Tie the payment to the Supabase User
    success_url: `${origin}/vault?success=true`,
    cancel_url: `${origin}/vault?canceled=true`,
  });

  return { url: session.url };
}
