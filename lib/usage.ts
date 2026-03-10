import { SupabaseClient } from "@supabase/supabase-js";

export const FREE_LIMIT = 5;

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

export async function getUsage(supabase: SupabaseClient, userId: string) {
  const month = getCurrentMonth();
  const { data } = await supabase
    .from("usage")
    .select("count")
    .eq("user_id", userId)
    .eq("month", month)
    .single();
  return data?.count ?? 0;
}

export async function getUserPlan(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  return (data?.plan ?? "free") as "free" | "pro";
}

export async function incrementUsage(supabase: SupabaseClient, userId: string) {
  const month = getCurrentMonth();
  await supabase.rpc("increment_usage", { p_user_id: userId, p_month: month }).then(() => {});
}

export async function checkUsageLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; count: number; plan: "free" | "pro" }> {
  const [plan, count] = await Promise.all([
    getUserPlan(supabase, userId),
    getUsage(supabase, userId),
  ]);

  if (plan === "pro") return { allowed: true, count, plan };
  return { allowed: count < FREE_LIMIT, count, plan };
}
