// pd-paypal — PayPal Live subscriptions for prophetdian.github.io
// Covers Navi Society ($500/mo) and the five ministry badges ($10-20/yr).
// verify_jwt: false. Frontend sends NO Authorization header.

const ALLOWED_ORIGINS = [
  "https://prophetdian.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
    "Content-Type": "application/json",
  };
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET")!;
const PAYPAL_API = "https://api-m.paypal.com";

interface PlanDef {
  name: string;
  price: string;
  interval: "MONTH" | "YEAR";
}

const PLANS: Record<string, PlanDef> = {
  society: { name: "Navi Society", price: "500", interval: "MONTH" },
  evangelist: { name: "Evangelist Badge", price: "10", interval: "YEAR" },
  pastor: { name: "Pastor Badge", price: "10", interval: "YEAR" },
  teacher: { name: "Teacher Badge", price: "10", interval: "YEAR" },
  apostle: { name: "Apostle Badge", price: "20", interval: "YEAR" },
  prophet: { name: "Prophet Badge", price: "20", interval: "YEAR" },
};

async function sb(path: string, init: RequestInit): Promise<Response> {
  return await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  });
}

async function getAccessToken(): Promise<string> {
  const basic = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || "Failed to get PayPal access token");
  }
  return data.access_token;
}

// Returns a cached or newly created PayPal plan_id for the given plan key.
async function getOrCreatePlan(token: string, planKey: string): Promise<string> {
  const def = PLANS[planKey];

  const cacheRes = await sb(
    `pd_plans?plan_key=eq.${planKey}&select=paypal_plan_id&order=created_at.desc&limit=1`,
    { method: "GET" },
  );
  const cached = await cacheRes.json();
  if (Array.isArray(cached) && cached.length > 0 && cached[0].paypal_plan_id) {
    return cached[0].paypal_plan_id;
  }

  const prodRes = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: def.name, type: "SERVICE" }),
  });
  const prod = await prodRes.json();
  if (!prodRes.ok || !prod.id) {
    throw new Error("Failed to create PayPal product");
  }

  const planRes = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: prod.id,
      name: def.name,
      billing_cycles: [
        {
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: { fixed_price: { value: def.price, currency_code: "USD" } },
          frequency: { interval_unit: def.interval, interval_count: 1 },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });
  const plan = await planRes.json();
  if (!planRes.ok || !plan.id) {
    throw new Error("Failed to create PayPal plan");
  }

  await sb(`pd_plans`, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ plan_key: planKey, paypal_plan_id: plan.id, paypal_product_id: prod.id }),
  });

  return plan.id;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers });
  }

  try {
    const body = await req.json();
    const action: string = body.action || "";

    if (action === "create-subscription") {
      const planKey: string = body.planKey || "";
      const email: string = body.email || "";
      if (!PLANS[planKey] || !email) {
        return new Response(JSON.stringify({ error: "invalid plan or email" }), { status: 200, headers });
      }
      const token = await getAccessToken();
      const planId = await getOrCreatePlan(token, planKey);

      const subRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          subscriber: { email_address: email },
          application_context: {
            return_url: "https://prophetdian.github.io",
            cancel_url: "https://prophetdian.github.io",
            user_action: "SUBSCRIBE_NOW",
          },
        }),
      });
      const sub = await subRes.json();
      if (!subRes.ok || !sub.id) {
        return new Response(JSON.stringify({ error: "Could not create subscription" }), { status: 200, headers });
      }
      return new Response(JSON.stringify({ subscriptionId: sub.id }), { status: 200, headers });
    }

    if (action === "activate") {
      const subscriptionId: string = body.subscriptionId || "";
      const email: string = body.email || "";
      const userId: string = body.userId || "";
      const planKey: string = body.planKey || "";
      if (!subscriptionId || !email || !userId || !PLANS[planKey]) {
        return new Response(JSON.stringify({ error: "missing fields" }), { status: 200, headers });
      }
      const token = await getAccessToken();
      const verifyRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const sub = await verifyRes.json();
      if (!verifyRes.ok || sub.status !== "ACTIVE") {
        return new Response(JSON.stringify({ error: "subscription not active" }), { status: 200, headers });
      }

      await sb(`pd_subscriptions`, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          user_id: userId,
          email,
          plan_key: planKey,
          paypal_subscription_id: subscriptionId,
          status: "active",
        }),
      });

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    if (action === "cancel-subscription") {
      const userId: string = body.userId || "";
      const planKey: string = body.planKey || "";
      if (!userId || !planKey) {
        return new Response(JSON.stringify({ error: "missing fields" }), { status: 200, headers });
      }

      const subsRes = await sb(
        `pd_subscriptions?user_id=eq.${userId}&plan_key=eq.${planKey}&status=eq.active&order=created_at.desc&limit=1`,
        { method: "GET" },
      );
      const subs = await subsRes.json();
      if (!Array.isArray(subs) || subs.length === 0) {
        return new Response(JSON.stringify({ error: "no active subscription" }), { status: 200, headers });
      }
      const paypalSubId: string | undefined = subs[0].paypal_subscription_id;

      if (paypalSubId) {
        try {
          const token = await getAccessToken();
          await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${paypalSubId}/cancel`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Customer requested cancellation" }),
          });
        } catch (_) {
          // fall through and downgrade locally
        }
      }

      await sb(`pd_subscriptions?user_id=eq.${userId}&plan_key=eq.${planKey}&status=eq.active`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 200, headers });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e instanceof Error ? e.message : e) }),
      { status: 200, headers },
    );
  }
});
