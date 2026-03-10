"use client";

import { useEffect, useState } from "react";

const SUMMARIZING_MESSAGES = [
  "핵심 내용 분석 중...",
  "중요 포인트 추출 중...",
  "타임라인 구성 중...",
  "핵심 요약 중...",
  "마무리 정리 중...",
];

interface LoadingStateProps {
  status: "fetching-transcript" | "summarizing";
  streamedText?: string;
}

export function LoadingState({ status }: LoadingStateProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (status !== "summarizing") return;
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % SUMMARIZING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, [status]);

  return (
    <div className="w-full max-w-3xl mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {status === "fetching-transcript"
            ? "자막을 가져오는 중..."
            : SUMMARIZING_MESSAGES[msgIndex]}
        </span>
      </div>

      {/* Skeleton */}
      <div className="mt-6 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-l-4 border-gray-200 pl-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
