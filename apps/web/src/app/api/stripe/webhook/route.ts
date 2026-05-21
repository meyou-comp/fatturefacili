import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        // Retrieve the subscription details from Stripe
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
          
          await prisma.organization.update({
            where: { id: session.metadata.orgId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              piano: (subscription.items.data[0].price.id === process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || subscription.items.data[0].price.id === process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID) ? 'PRO' : 'START',
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        const org = await prisma.organization.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              piano: (subscription.items.data[0].price.id === process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || subscription.items.data[0].price.id === process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID) ? 'PRO' : 'START',
            },
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        const org = await prisma.organization.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
              piano: 'BASE',
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Errore interno nel webhook' }, { status: 500 });
  }
}
