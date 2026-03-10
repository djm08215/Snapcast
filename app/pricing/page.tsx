"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import Link from "next/link";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function PricingPage() {
  const { user, plan, loading } = useAuth();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/pricing");
      return;
    }

    const tossPayments = await loadTossPayments(CLIENT_KEY);

    await tossPayments.requestBillingAuth("카드", {
      customerKey: user.id,
      successUrl: `${window.location.origin}/payments/billing-success`,
      failUrl: `${window.location.origin}/payments/billing-fail`,
      customerEmail: user.email!,
      customerName: user.user_metadata?.name ?? user.email!,
    });
  };

  const features = {
    free: [
      "월 5회 요약",
      "기본 타임라인",
      "PDF 다운로드",
    ],
    pro: [
      "무제한 요약",
      "전체 타임라인",
      "PDF 다운로드",
      "요약 히스토리 (DB 저장)",
      "우선 처리",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700 text-sm">
            ← 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">요금제</h1>
          <p className="text-gray-500">간단하고 투명한 가격</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Free</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">₩0</p>
              <p className="text-sm text-gray-500 mt-1">무료로 시작</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {features.free.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            {!loading && plan === "free" && !user && (
              <Link
                href="/auth/signup"
                className="block text-center w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                무료로 시작
              </Link>
            )}
            {!loading && plan === "free" && user && (
              <div className="text-center text-sm text-gray-400 py-2.5">현재 플랜</div>
            )}
            {!loading && plan === "pro" && (
              <div className="text-center text-sm text-gray-400 py-2.5">구독 중</div>
            )}
          </div>

          {/* Pro */}
          <div className="bg-blue-600 rounded-2xl border border-blue-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              추천
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Pro</p>
              <p className="text-4xl font-bold mt-1">₩9,900</p>
              <p className="text-sm text-blue-200 mt-1">/ 월</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {features.pro.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                  <span className="text-white font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            {!loading && plan !== "pro" && (
              <button
                onClick={handleSubscribe}
                className="w-full bg-white text-blue-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                Pro 구독 시작
              </button>
            )}
            {!loading && plan === "pro" && (
              <div className="text-center text-sm text-white/70 py-2.5">현재 플랜 ✓</div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          언제든지 취소 가능 · 구독 취소 후 현재 기간 만료까지 Pro 유지
        </p>
      </div>
    </div>
  );
}
