/**
 * Stripe webhook handler.
 *
 * Receives Stripe events at /api/webhooks/stripe. Currently handles:
 *   - checkout.session.completed  → provision API key, email customer
 *
 * Signature verification uses the Stripe-Signature header + STRIPE_WEBHOOK_SECRET
 * env var. We re-implement the HMAC check inline (no `stripe` npm dep yet) so
 * the build works before the SDK is installed.
 *
 * Required env vars:
 *   STRIPE_WEBHOOK_SECRET    whsec_...
 *   PERMIT_API_PROVISION_URL (optional) https://permit-api-production-6eae.up.railway.app/v1/admin/keys
 *   PERMIT_API_ADMIN_TOKEN   (optional) bearer token for the upstream admin endpoint
 *
 * If the upstream provisioning endpoint isn't configured, we log the
 * generated API key to the server logs with a TODO so the user can wire
 * it up later.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const PROVISION_URL = process.env.PERMIT_API_PROVISION_URL ?? "";
const PROVISION_TOKEN = process.env.PERMIT_API_ADMIN_TOKEN ?? "";

type StripeCheckoutSession = {
  id: string;
  object: "checkout.session";
  customer?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  subscription?: string | null;
  metadata?: Record<string, string> | null;
  amount_total?: number | null;
};

type StripeEvent = {
  id: string;
  type: string;
  data: { object: StripeCheckoutSession & Record<string, unknown> };
};

/**
 * Verify Stripe-Signature header per docs:
 *   https://stripe.com/docs/webhooks/signatures
 *
 * Header format: t=TIMESTAMP,v1=SIG1,v1=SIG2,...
 * Signed payload: `${t}.${rawBody}`
 * Compute HMAC-SHA256 with the webhook secret, compare to v1 signatures.
 */
function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): { ok: true } | { ok: false; reason: string } {
  if (!header) return { ok: false, reason: "missing_signature_header" };
  if (!secret) return { ok: false, reason: "missing_webhook_secret" };

  const parts = header.split(",").map((p) => p.trim());
  let timestamp: string | null = null;
  const v1Sigs: string[] = [];
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "t") timestamp = v;
    else if (k === "v1" && v) v1Sigs.push(v);
  }
  if (!timestamp || v1Sigs.length === 0)
    return { ok: false, reason: "malformed_signature_header" };

  const tsNum = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(tsNum))
    return { ok: false, reason: "invalid_timestamp" };
  const ageSec = Math.abs(Date.now() / 1000 - tsNum);
  if (ageSec > toleranceSeconds)
    return { ok: false, reason: "signature_timestamp_too_old" };

  const payload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  for (const sig of v1Sigs) {
    const sigBuf = Buffer.from(sig, "hex");
    if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf))
      return { ok: true };
  }
  return { ok: false, reason: "signature_mismatch" };
}

function generateApiKey(): string {
  // Matches the prefix used by the upstream Railway API (`pl_live_<32 hex>`).
  return `pl_live_${randomBytes(16).toString("hex")}`;
}

async function provisionKey(args: {
  email: string;
  customerId: string | null;
  subscriptionId: string | null;
  tier: string;
}): Promise<{ apiKey: string; provisioned: boolean; error?: string }> {
  const apiKey = generateApiKey();

  if (!PROVISION_URL || !PROVISION_TOKEN) {
    // TODO: wire up upstream provisioning. For now, just log so the user
    // can manually grant the key inside the permit-api admin.
    console.warn(
      "[stripe-webhook] PROVISION endpoint not configured — issuing key in-memory only.",
      {
        email: args.email,
        customerId: args.customerId,
        subscriptionId: args.subscriptionId,
        tier: args.tier,
        apiKey,
        todo: "Set PERMIT_API_PROVISION_URL + PERMIT_API_ADMIN_TOKEN to auto-provision.",
      },
    );
    return { apiKey, provisioned: false };
  }

  try {
    const res = await fetch(PROVISION_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${PROVISION_TOKEN}`,
      },
      body: JSON.stringify({
        email: args.email,
        stripe_customer_id: args.customerId,
        stripe_subscription_id: args.subscriptionId,
        plan: args.tier,
        api_key: apiKey,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[stripe-webhook] provision failed", res.status, text);
      return { apiKey, provisioned: false, error: `provision ${res.status}` };
    }
    return { apiKey, provisioned: true };
  } catch (err) {
    console.error("[stripe-webhook] provision error", err);
    return {
      apiKey,
      provisioned: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function emailKeyToCustomer(email: string, apiKey: string, tier: string) {
  // TODO: wire up a transactional email provider (Resend, Postmark, SES).
  // For now, log so the user knows the key was generated and to whom.
  console.warn("[stripe-webhook] email transport not configured — log only.", {
    email,
    apiKey,
    tier,
    todo: "Wire up a transactional email provider (Resend/Postmark/SES).",
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  const verify = verifyStripeSignature(rawBody, sigHeader, WEBHOOK_SECRET);
  if (!verify.ok) {
    return Response.json(
      { error: "signature_verification_failed", reason: verify.reason },
      { status: 400 },
    );
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return Response.json(
      { error: "invalid_json" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email =
      session.customer_details?.email ?? session.customer_email ?? null;
    const tier = session.metadata?.tier ?? "pro";

    if (!email) {
      console.warn("[stripe-webhook] session.completed without email", session.id);
      return Response.json({ received: true, warning: "no_email" });
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;

    const { apiKey, provisioned, error } = await provisionKey({
      email,
      customerId,
      subscriptionId,
      tier,
    });
    await emailKeyToCustomer(email, apiKey, tier);

    return Response.json({
      received: true,
      provisioned,
      tier,
      ...(error ? { provision_error: error } : {}),
    });
  }

  // Acknowledge unhandled event types so Stripe stops retrying.
  return Response.json({ received: true, type: event.type });
}

// Health probe for Stripe dashboard / manual debugging.
export async function GET() {
  return Response.json({
    ok: true,
    handler: "stripe-webhook",
    configured: {
      webhook_secret: Boolean(WEBHOOK_SECRET),
      provision_url: Boolean(PROVISION_URL),
      provision_token: Boolean(PROVISION_TOKEN),
    },
  });
}
