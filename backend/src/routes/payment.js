import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe with secret key from environment variables
const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY) 
    : null;

/**
 * POST /api/payment/create-checkout-session
 * Creates a Stripe checkout session for package booking
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ 
                error: 'Payment service not configured. Please add STRIPE_SECRET_KEY to environment variables.' 
            });
        }

        const { packageId, packageName, amount, quantity = 1 } = req.body;

        // Validate required fields
        if (!packageId || !packageName || !amount) {
            return res.status(400).json({ 
                error: 'Missing required fields: packageId, packageName, amount' 
            });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: packageName,
                            description: `Travel package booking - Package ID: ${packageId}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe uses cents
                    },
                    quantity: quantity,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5500'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5500'}?payment=cancelled`,
            metadata: {
                packageId: packageId.toString(),
                packageName: packageName,
            },
        });

        res.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            message: error.message 
        });
    }
});

/**
 * POST /api/payment/webhook
 * Stripe webhook to handle payment events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
        return res.status(500).send('Webhook not configured');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful:', session);
            
            // TODO: Save booking to database
            // TODO: Send confirmation email
            
            break;
        case 'checkout.session.expired':
            console.log('Checkout session expired');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

/**
 * GET /api/payment/session/:sessionId
 * Retrieve checkout session details
 */
router.get('/session/:sessionId', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Payment service not configured' });
        }

        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        
        res.json({
            status: session.payment_status,
            customerEmail: session.customer_details?.email,
            amountTotal: session.amount_total / 100, // Convert from cents
            metadata: session.metadata
        });

    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve session',
            message: error.message 
        });
    }
});

export default router;
