"use client";

import { useState } from "react";
import { Top, BottomSheet } from "@toss/tds-mobile";

interface AppNavBarProps {
  showReset?: boolean;
  onReset?: () => void;
}

export function AppNavBar({ showReset, onReset }: AppNavBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const handleShare = async () => {
    setMoreOpen(false);
    try {
      const { share } = await import("@apps-in-toss/web-bridge");
      await share({ message: "Snapcast - 유튜브 영상을 AI로 요약해드립니다 https://snapcast-gilt.vercel.app" });
    } catch {
      // Fallback for non-Toss environments
      if (navigator.share) {
        navigator.share({
          title: "Snapcast",
          text: "유튜브 영상을 AI로 요약해드립니다",
          url: window.location.href,
        }).catch(() => {});
      }
    }
  };

  return (
    <>
      <Top
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/snapcast.png" alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "contain" }} />
            <span style={{ fontWeight: 700, fontSize: 17, color: "#111" }}>Snapcast</span>
          </div>
        }
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {showReset && onReset && (
              <button
                onClick={onReset}
                style={{ fontSize: 14, color: "#888", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
              >
                새로 시작
              </button>
            )}
            <button
              onClick={() => setMoreOpen(true)}
              aria-label="더보기"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 20, color: "#333", lineHeight: 1 }}
            >
              ···
            </button>
          </div>
        }
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      />

      <BottomSheet open={moreOpen} onDimmerClick={() => setMoreOpen(false)}>
        <BottomSheet.Header>더보기</BottomSheet.Header>
        <div style={{ padding: "8px 20px 24px" }}>
          <button
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "14px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#111",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            공유하기
          </button>
          <a
            href="https://toss.im/report"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMoreOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "14px 0",
              fontSize: 16,
              color: "#111",
              textDecoration: "none",
            }}
          >
            앱 신고하기
          </a>
        </div>
      </BottomSheet>
    </>
  );
}
