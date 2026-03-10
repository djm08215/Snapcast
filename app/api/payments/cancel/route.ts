import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const now = new Date().toISOString();

  const { error: subErr } = await service
    .from("subscriptions")
    .update({ status: "cancelled", updated_at: now })
    .eq("user_id", user.id)
    .eq("status", "active");

  if (subErr) {
    return Response.json({ error: "구독 취소 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 현재 기간 만료 후 free로 전환 (즉시 취소 X, 기간 만료 후 적용)
  // 바로 free 전환을 원하면 아래 주석 해제
  // await service.from("profiles").update({ plan: "free", updated_at: now }).eq("id", user.id);

  return Response.json({ success: true });
}
