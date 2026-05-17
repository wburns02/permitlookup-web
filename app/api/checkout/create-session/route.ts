/**
 * Stripe Checkout session creator.
 *
 * Scaffolded WITHOUT a hard dependency on the `stripe` npm package — instead
 * we hit Stripe's REST API directly via fetch. That keeps the build green
 * before the user installs the SDK + sets keys.
 *
 * Required env vars (set in Vercel project envs):
 *   STRIPE_SECRET_KEY        sk_live_... or sk_test_...
 *   STRIPE_PRICE_ID_PRO      price_... (the recurring price for the Pro plan)
 *   STRIPE_PRICE_ID_ENTERPRISE  price_... (optional, only if Enterprise self-serve)
 *   NEXT_PUBLIC_SITE_URL     https://broadband.ecbtx.com (for success/cancel)
 *
 * If STRIPE_SECRET_KEY is unset we return 503 with a helpful TODO so the
 * deploy doesn't crash before keys are pasted in.
 *
 * POST /api/checkout/create-session  body: { tier: "pro" | "enterprise" }
 *   → 200 { url: "https://checkout.stripe.com/..." }
 *   → 503 { error, message }   if Stripe not configured
 *   → 4xx { error, message }   on bad input / Stripe error
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://broadband.ecbtx.com";

type Body = { tier?: "pro" | "enterprise" };

function priceIdFor(tier: "pro" | "enterprise"): string | undefined {
  if (tier === "pro") return process.env.STRIPE_PRICE_ID_PRO;
  if (tier === "enterprise") return process.env.STRIPE_PRICE_ID_ENTERPRISE;
  return undefined;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return Response.json(
      {
        error: "stripe_not_configured",
        message:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID_PRO in the Vercel project environment variables. See STRIPE_SETUP_TODO.md in the repo root for full setup steps.",
      },
      { status: 503 },
    );
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // empty body is fine, defaults to "pro"
  }
  const tier = body.tier === "enterprise" ? "enterprise" : "pro";
  const priceId = priceIdFor(tier);
  if (!priceId) {
    return Response.json(
      {
        error: "price_not_configured",
        message: `Missing env var STRIPE_PRICE_ID_${tier.toUpperCase()}. Create the Stripe product+price, then paste the price_... id into Vercel.`,
      },
      { status: 503 },
    );
  }

  // Build form-encoded body for Stripe REST API.
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${SITE_URL}/broadband/portal?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${SITE_URL}/broadband/pricing?cancelled=1`);
  params.set("allow_promotion_codes", "true");
  params.set("billing_address_collection", "auto");
  params.set("customer_creation", "always");
  params.set("metadata[tier]", tier);

  let stripeRes: Response;
  try {
    stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    return Response.json(
      {
        error: "stripe_unreachable",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const json = (await stripeRes.json().catch(() => ({}))) as {
    url?: string;
    id?: string;
    error?: { message?: string; code?: string };
  };

  if (!stripeRes.ok || !json.url) {
    return Response.json(
      {
        error: "stripe_error",
        message: json.error?.message ?? `Stripe returned ${stripeRes.status}`,
        code: json.error?.code,
      },
      { status: 502 },
    );
  }

  return Response.json({ url: json.url, id: json.id });
}
