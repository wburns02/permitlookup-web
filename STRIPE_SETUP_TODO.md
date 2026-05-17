# Stripe Gate Setup — TODO

The Broadband API now has a Stripe-gated checkout flow scaffolded at:

- `/broadband/pricing` — public tier cards (Free / Pro $49 / Enterprise $499)
- `/api/checkout/create-session` — POST to create a Stripe Checkout session
- `/api/webhooks/stripe` — webhook receiver (signature-verified)
- `/broadband/portal` — customer self-service for API keys + usage

Stripe API calls are made via raw `fetch()` against `api.stripe.com` so this
ships without adding the `stripe` npm dependency. If you'd rather use the
official SDK later, `npm install stripe` and refactor the two route handlers.

Until the env vars below are set, the create-session route returns **503**
with a helpful message instead of crashing the deploy.

---

## 1. Stripe Dashboard — create products and prices

In <https://dashboard.stripe.com/products>:

1. **Pro** product
   - Name: `Broadband API — Pro`
   - Recurring price: `$49.00 / month USD`
   - Copy the `price_xxx` id → goes in `STRIPE_PRICE_ID_PRO`
2. **Enterprise** product (optional self-serve; current page uses mailto)
   - Name: `Broadband API — Enterprise`
   - Recurring price: `$499.00 / month USD`
   - Copy the `price_xxx` id → goes in `STRIPE_PRICE_ID_ENTERPRISE`

## 2. Stripe Dashboard — create webhook endpoint

In <https://dashboard.stripe.com/webhooks>:

- Endpoint URL: `https://broadband.ecbtx.com/api/webhooks/stripe`
  (or `https://hail.ecbtx.com/api/webhooks/stripe` until the broadband
  subdomain DNS lands — they share the same Vercel deployment.)
- Events to send:
  - `checkout.session.completed`  (required — provisions the API key)
  - `customer.subscription.deleted` (recommended — revoke keys on cancel)
  - `customer.subscription.updated` (recommended — change plan caps)
- Copy the signing secret `whsec_xxx` → goes in `STRIPE_WEBHOOK_SECRET`

## 3. Vercel — paste env vars

In <https://vercel.com/wburns02/permitlookup-web/settings/environment-variables>,
add (Production scope):

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...      # optional
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://broadband.ecbtx.com
```

If you want webhook events to auto-provision API keys on the upstream
permit-api, also add:

```
PERMIT_API_PROVISION_URL=https://permit-api-production-6eae.up.railway.app/v1/admin/keys
PERMIT_API_ADMIN_TOKEN=<your admin bearer token>
```

Without those two, the webhook still verifies the signature and generates a
key — it just logs the key to the Vercel runtime logs with a TODO so you can
manually grant it inside the permit-api admin.

## 4. Wire up transactional email

The webhook calls `emailKeyToCustomer()` which currently only `console.warn`s
the generated API key. Pick one and replace that function body:

- **Resend** (`resend.com`): `npm i resend`, send via `resend.emails.send({ to, from, subject, html })`
- **Postmark**, **SES**, **SendGrid** — all 5-line drop-ins.

Until that's wired, you can pull the API key out of Vercel logs after each
`checkout.session.completed` event and email it manually.

## 5. Test end-to-end with Stripe CLI

```bash
# Install stripe CLI (one-time)
brew install stripe/stripe-cli/stripe

# Log in to the project
stripe login

# Forward live webhook events to local dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another shell, trigger a test event
stripe trigger checkout.session.completed
```

You should see a 200 from the webhook handler and a `console.warn` line in
the Next dev server showing the generated `pl_live_...` key.

## 6. Wire portal data (post-Stripe)

`/broadband/portal` calls two endpoints that currently 404:

- `POST /api/portal/auth` — magic-link sign-in (issue signed cookie)
- `GET /api/portal/me` — returns `{ email, keys[], usage }` for the cookie's user

When you implement them, the portal page renders sign-in → keys table →
usage bar with zero further frontend work.

## Quick verify checklist

- [ ] `/broadband/pricing` renders 3 tier cards (already true — Stripe-independent)
- [ ] Click "Subscribe" → 503 banner with "Stripe is not configured" until env vars set
- [ ] After env vars: click "Subscribe" → redirects to Stripe Checkout
- [ ] Complete test checkout → webhook receives `checkout.session.completed` → key logged
- [ ] Customer receives email with API key (after step 4)
- [ ] Customer can sign in at `/broadband/portal` and see their key (after step 6)
