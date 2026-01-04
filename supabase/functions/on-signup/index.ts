import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const user = payload?.user ?? {};
    const email = user?.email ?? null;
    const userId = user?.id ?? null;

    const webhookUrl = Deno.env.get("N8N_SIGNUP_WEBHOOK_URL");
    if (!webhookUrl) {
      return new Response("Missing N8N_SIGNUP_WEBHOOK_URL", { status: 500 });
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-idempotency-key": userId ?? "",
      },
      body: JSON.stringify({
        event: "user_signup",
        email,
        user_id: userId,
      }),
    });

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Signup webhook error:", error);
    return new Response("error", { status: 500 });
  }
});
