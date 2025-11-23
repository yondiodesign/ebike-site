# 🚀 Netlify Deployment with Stripe Payments

## ✅ What's Now Included

Your site now has a **real backend** using Netlify Functions!

- ✅ Creates actual Payment Intents
- ✅ Processes real charges
- ✅ Shows in Stripe Dashboard
- ✅ Secure (Secret Key on backend)
- ✅ Free hosting

---

## 🔑 CRITICAL: Set Up Environment Variables

Before payments will work, you MUST add your Stripe Secret Key to Netlify:

### Step 1: Get Your Stripe Secret Key

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_...`)
3. ⚠️ **NEVER commit this key to GitHub!**

### Step 2: Add to Netlify

1. Go to your Netlify site dashboard
2. Click **Site configuration** → **Environment variables**
3. Click **Add a variable**
4. Add:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_test_YOUR_ACTUAL_SECRET_KEY_HERE`
5. Click **Save**

### Step 3: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete

---

## 🧪 Testing Payments

Once deployed with the environment variable:

### Test Card Numbers:

**✅ Successful Payment:**
- Card: `4242 4242 4242 4242`
- Any future date, any CVC, any ZIP

**❌ Card Declined:**
- Card: `4000 0000 0000 0002`

**❌ Insufficient Funds:**
- Card: `4000 0000 0000 9995`

**❌ Stolen Card:**
- Card: `4000 0000 0000 9979`

**🔒 Requires Authentication (3D Secure):**
- Card: `4000 0027 6000 3184`

---

## 📊 View Payments in Stripe Dashboard

After making a test payment:

1. Go to: https://dashboard.stripe.com/test/payments
2. You should see your payment with:
   - ✅ Amount charged
   - ✅ Payment status (succeeded/failed)
   - ✅ Customer email
   - ✅ Card details
   - ✅ Full transaction details

---

## 🔄 How It Works

### Frontend (index.html):
1. User enters card info
2. Calls `/.netlify/functions/create-payment-intent`
3. Receives a client secret
4. Confirms payment with Stripe
5. Shows success/error

### Backend (netlify/functions/create-payment-intent.js):
1. Receives payment amount
2. Uses Secret Key to create Payment Intent
3. Returns client secret to frontend
4. Stripe processes the payment

---

## 🛡️ Security

✅ **What's Secure:**
- Secret Key never exposed to frontend
- Payment Intent created on backend
- Stripe validates card server-side
- HTTPS enforced by Netlify

⚠️ **What You Should Add Later:**
- Cart validation (verify prices on backend)
- User authentication
- Order tracking
- Email notifications
- Webhook handlers for payment events

---

## 📦 Files Added

```
netlify/
  functions/
    create-payment-intent.js    # Serverless function for payments
package.json                    # Stripe dependency
.gitignore                      # Prevents committing sensitive files
```

---

## 🔧 Troubleshooting

### Error: "Failed to create payment intent"
**Solution:** Make sure you've added `STRIPE_SECRET_KEY` to Netlify environment variables

### Error: "stripe is not defined" in function
**Solution:** Run `npm install` locally and push package.json to GitHub

### Payments not showing in Stripe Dashboard
**Solution:** Make sure you're using your **Secret Key** (sk_test_...) in Netlify, not the Publishable Key

### Function returns 500 error
**Solution:** 
1. Check Netlify function logs (Site → Functions → View logs)
2. Verify your Secret Key is correct
3. Make sure Stripe package is installed

---

## 🎉 Next Steps

1. ✅ Set environment variable in Netlify
2. ✅ Redeploy site
3. ✅ Test payment with 4242 card
4. ✅ Check Stripe Dashboard for payment
5. 🎊 Celebrate - you have real payment processing!

---

## 🚨 Before Going Live (Production)

When ready for real customers:

1. **Switch to Live Keys:**
   - Update Netlify env var: `STRIPE_SECRET_KEY` → `sk_live_...`
   - Update index.html: `STRIPE_PUBLISHABLE_KEY` → `pk_live_...`

2. **Add Backend Validation:**
   - Verify cart contents on backend
   - Validate prices server-side
   - Check product availability

3. **Set Up Webhooks:**
   - Listen for `payment_intent.succeeded`
   - Handle order fulfillment
   - Send confirmation emails

4. **Add Order Management:**
   - Database for orders
   - Customer accounts
   - Order history

5. **Legal Requirements:**
   - Terms of Service
   - Privacy Policy
   - Refund Policy
   - Shipping Policy

---

## 💰 Costs

- **Netlify Hosting:** FREE (100GB bandwidth/month)
- **Netlify Functions:** FREE (125k requests/month)
- **Stripe Fees:** 2.9% + $0.30 per successful charge
- **Total:** FREE to run, only pay Stripe fees on sales!

---

Need help? Check the Netlify and Stripe docs:
- Netlify Functions: https://docs.netlify.com/functions/overview/
- Stripe API: https://stripe.com/docs/api
- Stripe Testing: https://stripe.com/docs/testing

