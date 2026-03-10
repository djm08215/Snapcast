"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface AppNavBarProps {
  showReset?: boolean;
  onReset?: () => void;
}

export function AppNavBar({ showReset, onReset }: AppNavBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, plan } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  const handleShare = async () => {
    setMoreOpen(false);
    if (navigator.share) {
      navigator.share({
        title: "Snapcast",
        text: "유튜브 영상을 AI로 요약해드립니다",
        url: window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid #e5e7eb",
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
    }}>
      {/* 로고 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/snapcast.png" alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 17, color: "#111" }}>Snapcast</span>
      </div>

      {/* 우측 버튼들 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {showReset && onReset && (
          <button
            onClick={onReset}
            style={{ fontSize: 14, color: "#888", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
          >
            새로 시작
          </button>
        )}
        {user ? (
          <button
            onClick={() => router.push("/subscription")}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: plan === "pro" ? "#2563eb" : "#888",
              background: plan === "pro" ? "#eff6ff" : "#f3f4f6",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              padding: "3px 8px",
            }}
          >
            {plan === "pro" ? "Pro" : "Free"}
          </button>
        ) : (
          <button
            onClick={() => router.push("/auth/login")}
            style={{ fontSize: 13, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontWeight: 600 }}
          >
            로그인
          </button>
        )}

        {/* 더보기 드롭다운 */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="더보기"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 20, color: "#333", lineHeight: 1 }}
          >
            ···
          </button>
          {moreOpen && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              minWidth: 160,
              overflow: "hidden",
            }}>
              {[
                { label: "요금제 보기", onClick: () => { setMoreOpen(false); router.push("/pricing"); } },
                { label: "공유하기", onClick: handleShare },
              ].map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "13px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    fontSize: 15,
                    color: "#111",
                    textAlign: "left",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
