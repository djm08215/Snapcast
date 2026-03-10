"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { Suspense } from "react";

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshPlan } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const authKey = searchParams.get("authKey");
    const customerKey = searchParams.get("customerKey");

    if (!authKey || !customerKey) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payments/billing-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authKey, customerKey }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.error) {
          setErrorMsg(data.error);
          setStatus("error");
        } else {
          await refreshPlan();
          setStatus("success");
          setTimeout(() => router.push("/"), 3000);
        }
      })
      .catch(() => {
        setErrorMsg("서버 오류가 발생했습니다.");
        setStatus("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "processing") {
    return (
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">결제를 처리하고 있습니다...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pro 구독 완료!</h2>
        <p className="text-gray-500 text-sm mb-6">이제 무제한으로 요약을 사용할 수 있습니다.</p>
        <p className="text-xs text-gray-400">3초 후 메인 페이지로 이동합니다...</p>
        <Link href="/" className="mt-4 inline-block text-sm text-blue-600 font-medium hover:underline">
          바로 이동 →
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">결제 처리 실패</h2>
      <p className="text-red-500 text-sm mb-6">{errorMsg}</p>
      <Link href="/pricing" className="text-sm text-blue-600 font-medium hover:underline">
        다시 시도
      </Link>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full">
        <Suspense fallback={<div className="text-center text-gray-400 text-sm">로딩 중...</div>}>
          <BillingSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
