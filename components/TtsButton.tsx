"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTTS } from "@/hooks/useTTS";
import { SummaryResult } from "@/lib/types";

function buildTtsScript(result: SummaryResult): string {
  const parts: string[] = [];

  if (result.videoTitle) parts.push(`${result.videoTitle}.`);
  parts.push("전체 요약.");
  parts.push(result.overallSummary);
  parts.push("타임라인.");

  for (const point of result.timeline) {
    parts.push(`${point.timestamp}. ${point.title}.`);
    if (point.keyPoints.length > 0) {
      parts.push(point.keyPoints.join(". ") + ".");
    }
  }

  return parts.join(" ");
}

export function TtsButton({ result }: { result: SummaryResult }) {
  const { plan, user } = useAuth();
  const { status, speak, pause, resume, stop } = useTTS();

  if (status === "unsupported") return null;

  if (!user || plan !== "pro") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>TTS</span>
        <Link href="/pricing" className="text-blue-500 hover:underline text-xs">
          Pro 전용
        </Link>
      </div>
    );
  }

  const handleClick = () => {
    if (status === "idle") {
      speak(buildTtsScript(result));
    } else if (status === "playing") {
      pause();
    } else if (status === "paused") {
      resume();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        {status === "idle" && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M6.343 9.657a8 8 0 000 4.686" />
            </svg>
            듣기
          </>
        )}
        {status === "playing" && (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            일시정지
          </>
        )}
        {status === "paused" && (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            이어듣기
          </>
        )}
      </button>
      {(status === "playing" || status === "paused") && (
        <button
          onClick={stop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          정지
        </button>
      )}
    </div>
  );
}
