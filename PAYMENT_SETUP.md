# Payment Integration Setup Guide

## Overview

The travel agency website now includes a complete payment integration using Stripe for secure package bookings.

## Features Added

✅ Travel packages with detailed facilities and itineraries
✅ Package details modal with full information
✅ Stripe payment integration for secure checkout
✅ Payment success/failure handling
✅ Backend payment routes with webhook support

## Setup Instructions

### 1. Get Stripe API Keys

1. Sign up for a free Stripe account at https://dashboard.stripe.com/register
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your **Secret Key** (starts with `sk_test_...`)
4. For webhooks (optional), get your **Webhook Secret** from https://dashboard.stripe.com/test/webhooks

### 2. Configure Environment Variables

Add these to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
FRONTEND_URL=http://localhost:5500
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The server will run on http://localhost:4000

### 4. Open the Website

Open `index.html` in your browser (or use Live Server extension in VS Code)

## How to Test

### Test the Package Booking Flow:

1. Navigate to the **Packages** section on the website
2. Click **"View Package Details"** on any package
3. Review the facilities, includes, and itinerary
4. Click **"Book Now - Secure Payment"**
5. You'll be redirected to Stripe's test checkout page
6. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
7. Complete the payment
8. You'll be redirected back with a success message

### Test Card Numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

See more test cards: https://stripe.com/docs/testing#cards

## Available Packages

1. **Romantic Europe** - $2,999 (12 days)
   - Paris, Barcelona, Venice
   - 5-star luxury hotels
   - Private tours and transfers

2. **Asia Adventure** - $3,499 (15 days)
   - Tokyo, Bangkok, Bali
   - 4-star accommodations
   - Adventure activities included

3. **Beach Escape** - $2,299 (10 days)
   - Bali, Maldives, Fiji
   - Beachfront resorts
   - All-inclusive meals

4. **City Hopper** - $2,199 (10 days)
   - New York, Miami, Los Angeles
   - Central city hotels
   - Entertainment passes

5. **Luxury Middle East** - $2,899 (7 days)
   - Dubai, Abu Dhabi
   - 5-star luxury
   - Private chauffeur

## API Endpoints

### Create Checkout Session

```
POST /api/payment/create-checkout-session
Content-Type: application/json

{
  "packageId": 1,
  "packageName": "Romantic Europe",
  "amount": 2999,
  "quantity": 1
}

Response:
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Get Session Details

```
GET /api/payment/session/:sessionId

Response:
{
  "status": "paid",
  "customerEmail": "user@example.com",
  "amountTotal": 2999,
  "metadata": { ... }
}
```

### Webhook (for Stripe events)

```
POST /api/payment/webhook
Content-Type: application/json
Stripe-Signature: ...

Handles: checkout.session.completed, checkout.session.expired
```

## File Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── payment.js       # Payment API routes
│   │   └── server.js            # Updated with payment routes
│   └── .env                     # Stripe keys here
├── data/
│   └── packages.json            # Enhanced package data
├── css/
│   └── styles.css               # Package & modal styles
├── js/
│   └── main.js                  # Payment integration
└── index.html                   # Package section & modal
```

## Security Features

✅ Stripe's PCI-compliant hosted checkout
✅ No credit card data touches your server
✅ HTTPS enforced in production
✅ Rate limiting on payment endpoints
✅ CORS protection
✅ Webhook signature verification

## Production Deployment

When deploying to production:

1. Replace test keys with live keys from Stripe dashboard
2. Update `FRONTEND_URL` to your production domain
3. Set up Stripe webhooks pointing to `https://yourdomain.com/api/payment/webhook`
4. Enable HTTPS (required by Stripe)
5. Update `CORS_ALLOWED_ORIGINS` to include production domain

## Troubleshooting

### "Payment service not configured" error

- Check that `STRIPE_SECRET_KEY` is set in backend/.env
- Restart the backend server after adding the key

### Payment button not working

- Check browser console for errors
- Ensure backend server is running on port 4000
- Verify API_BASE is correctly set in main.js

### CORS errors

- Add your frontend URL to `CORS_ALLOWED_ORIGINS` in backend/.env
- Format: `http://localhost:5500,https://yourdomain.com`

## Next Steps

- [ ] Set up email notifications for successful bookings
- [ ] Save booking data to Supabase database
- [ ] Add customer dashboard for viewing bookings
- [ ] Implement refund/cancellation flow
- [ ] Add discount codes support

## Support

For Stripe documentation: https://stripe.com/docs
For issues: Check browser console and backend logs
