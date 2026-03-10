"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FREE_LIMIT } from "@/lib/usage";

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string;
}

export default function SubscriptionPage() {
  const { user, plan, usageCount, loading, signOut, refreshPlan } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
      .then(({ data }) => setSub(data));
  }, [user]);

  const handleCancel = async () => {
    if (!confirm("구독을 취소하면 현재 기간 만료 후 Free로 전환됩니다. 계속하시겠습니까?")) return;
    setCancelling(true);
    const res = await fetch("/api/payments/cancel", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      await refreshPlan();
      setSub(null);
    } else {
      alert(data.error ?? "취소 중 오류가 발생했습니다.");
    }
    setCancelling(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !user) return null;

  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("ko-KR")
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← 돌아가기</Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">내 계정</h1>

        {/* 프로필 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-400 mb-1">이메일</p>
          <p className="font-medium text-gray-800">{user.email}</p>
        </div>

        {/* 현재 플랜 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">현재 플랜</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              plan === "pro" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
            }`}>
              {plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>

          {plan === "free" && (
            <>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">이번 달 사용</span>
                <span className="font-semibold text-gray-800">{usageCount} / {FREE_LIMIT}회</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((usageCount / FREE_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <Link
                href="/pricing"
                className="block w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold text-center hover:bg-blue-700 transition-colors"
              >
                Pro로 업그레이드 — ₩9,900/월
              </Link>
            </>
          )}

          {plan === "pro" && sub && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                다음 결제일: <span className="font-medium text-gray-700">{periodEnd}</span>
              </p>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full text-sm text-red-500 border border-red-200 py-2 rounded-xl hover:bg-red-50 disabled:opacity-60 transition-colors"
              >
                {cancelling ? "처리 중..." : "구독 취소"}
              </button>
            </>
          )}

          {plan === "pro" && !sub && (
            <p className="text-sm text-gray-500">구독 정보를 불러오는 중...</p>
          )}
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleSignOut}
          className="w-full text-sm text-gray-500 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors bg-white"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
