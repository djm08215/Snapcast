"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
          <p className="text-gray-500 text-sm">
            <span className="font-medium text-gray-700">{email}</span>로 인증 메일을 보냈습니다.
            메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-blue-600 font-medium hover:underline"
          >
            로그인 페이지로 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/snapcast.png" alt="Snapcast" className="w-12 h-12 rounded-xl mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-500 text-sm mt-1">무료로 시작해보세요</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="홍길동"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hello@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="8자 이상"
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
