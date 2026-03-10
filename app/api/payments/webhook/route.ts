import { createSupabaseServiceClient } from "@/lib/supabase-server";

// 토스페이먼츠 웹훅 시크릿 (개발자센터 > 웹훅 설정에서 발급)
const WEBHOOK_SECRET = process.env.TOSS_WEBHOOK_SECRET;

export async function POST(req: Request) {
  // 웹훅 서명 검증
  const signature = req.headers.get("toss-signature");
  if (WEBHOOK_SECRET && !signature?.includes(WEBHOOK_SECRET)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { eventType, data } = body;

  console.log("Toss webhook:", eventType, data?.orderId);

  const service = createSupabaseServiceClient();

  switch (eventType) {
    // 결제 완료 (정기 자동결제)
    case "PAYMENT_STATUS_CHANGED": {
      if (data?.status === "DONE") {
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        // orderId로 구독 갱신
        await service
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: nextMonth.toISOString(),
            last_order_id: data.orderId,
            updated_at: now.toISOString(),
          })
          .eq("last_order_id", data.orderId);
      }
      break;
    }

    // 빌링키 삭제 (카드 만료 등)
    case "BILLING_KEY_DELETED": {
      await service
        .from("subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("billing_key", data?.billingKey);

      // 해당 유저를 free로 전환
      const { data: sub } = await service
        .from("subscriptions")
        .select("user_id")
        .eq("billing_key", data?.billingKey)
        .single();

      if (sub) {
        await service
          .from("profiles")
          .update({ plan: "free", updated_at: new Date().toISOString() })
          .eq("id", sub.user_id);
      }
      break;
    }
  }

  return Response.json({ received: true });
}
