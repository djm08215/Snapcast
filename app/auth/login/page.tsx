"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "이메일 또는 비밀번호가 올바르지 않습니다."
        : error.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/snapcast.png" alt="Snapcast" className="w-12 h-12 rounded-xl mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-500 text-sm mt-1">Snapcast에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
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
              placeholder="••••••••"
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
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          계정이 없으신가요?{" "}
          <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
