import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { stripe } from '../lib/stripe';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/subscription/checkout
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { plan } = req.body as { plan: 'monthly' | 'annual' };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: plan === 'annual'
            ? process.env.STRIPE_ANNUAL_PRICE_ID!
            : process.env.STRIPE_MONTHLY_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/profile/subscription?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/profile/subscription?canceled=true`,
      metadata: { userId: user.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// GET /api/subscription/status
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    let subscription = await prisma.subscription.findUnique({ where: { userId } });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { userId, status: 'free' },
      });
    }

    res.json({
      userId: subscription.userId,
      status: subscription.status,
      renewalDate: subscription.renewalDate?.toISOString() ?? null,
      stripeCustomerId: subscription.stripeCustomerId ?? null,
    });
  } catch (err) {
    console.error('Subscription status error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// POST /api/subscription/portal (stub)
router.post('/portal', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ url: '#' });
});

// POST /api/webhooks/stripe — raw body, no auth
export function createStripeWebhookRouter(): Router {
  const webhookRouter = Router();

  webhookRouter.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response): Promise<void> => {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        res.status(500).json({ error: 'Webhook secret not configured' });
        return;
      }

      let event: import('stripe').Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
      } catch (err) {
        console.error('Webhook signature error:', err);
        res.status(400).json({ error: 'Invalid signature' });
        return;
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as import('stripe').Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            if (!userId) break;

            const stripeSubscriptionId = session.subscription as string;
            let renewalDate: Date | null = null;

            if (stripeSubscriptionId) {
              const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
              renewalDate = new Date(stripeSub.current_period_end * 1000);
            }

            await prisma.subscription.upsert({
              where: { userId },
              update: {
                status: 'reserve',
                stripeCustomerId: session.customer as string ?? null,
                renewalDate,
              },
              create: {
                userId,
                status: 'reserve',
                stripeCustomerId: session.customer as string ?? null,
                renewalDate,
              },
            });
            break;
          }

          case 'customer.subscription.deleted': {
            const stripeSub = event.data.object as import('stripe').Stripe.Subscription;
            const customerId = stripeSub.customer as string;
            const sub = await prisma.subscription.findFirst({
              where: { stripeCustomerId: customerId },
            });
            if (sub) {
              await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'free', renewalDate: null },
              });
            }
            break;
          }

          case 'customer.subscription.updated': {
            const stripeSub = event.data.object as import('stripe').Stripe.Subscription;
            const customerId = stripeSub.customer as string;
            const sub = await prisma.subscription.findFirst({
              where: { stripeCustomerId: customerId },
            });
            if (sub) {
              await prisma.subscription.update({
                where: { id: sub.id },
                data: { renewalDate: new Date(stripeSub.current_period_end * 1000) },
              });
            }
            break;
          }
        }
      } catch (err) {
        console.error('Webhook handler error:', err);
      }

      res.json({ received: true });
    }
  );

  return webhookRouter;
}

// Need express for raw body
import express from 'express';

export default router;
