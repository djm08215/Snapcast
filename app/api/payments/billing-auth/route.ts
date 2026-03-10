import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";
import { issueBillingKey, chargeBilling } from "@/lib/toss";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { authKey, customerKey } = await req.json();
  if (!authKey || !customerKey) {
    return Response.json({ error: "authKey, customerKey가 필요합니다." }, { status: 400 });
  }

  try {
    // 1. 빌링키 발급
    const { billingKey } = await issueBillingKey(authKey, customerKey);

    // 2. 첫 달 즉시 결제
    const orderId = `order_${user.id.slice(0, 8)}_${Date.now()}`;
    await chargeBilling({
      billingKey,
      customerKey,
      customerEmail: user.email!,
      orderId,
    });

    // 3. DB 저장 (service role — RLS 우회)
    const service = createSupabaseServiceClient();
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await service.from("subscriptions").upsert(
      {
        user_id: user.id,
        billing_key: billingKey,
        plan: "pro",
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
        last_order_id: orderId,
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    );

    await service
      .from("profiles")
      .update({ plan: "pro", updated_at: now.toISOString() })
      .eq("id", user.id);

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "결제 처리 중 오류가 발생했습니다.";
    console.error("billing-auth error:", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
