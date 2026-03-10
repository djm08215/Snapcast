"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function BillingFailContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "카드 등록에 실패했습니다.";

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">😢</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">결제 실패</h2>
      <p className="text-gray-500 text-sm mb-6">{message}</p>
      <div className="flex flex-col gap-2">
        <Link
          href="/pricing"
          className="block w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold text-center hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:underline text-center">
          메인으로
        </Link>
      </div>
    </div>
  );
}

export default function BillingFailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full">
        <Suspense fallback={null}>
          <BillingFailContent />
        </Suspense>
      </div>
    </div>
  );
}
