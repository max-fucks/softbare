/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-07-29.dahlia',
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();

  const body = await req.text(); // Must read as raw text for Stripe signature verification
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) return new Response('No signature', { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id; // The Supabase user ID we passed in Step 14

    if (userId) {
      // Upgrade the user's account status in the database using the Admin client
      const { error } = await supabaseAdmin
        .from('users')
        .update({ is_black_card: true, vault_limit: 50 })
        .eq('id', userId);

      if (error) {
        console.error('Error upgrading user vault:', error);
        return new Response('Database error', { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
