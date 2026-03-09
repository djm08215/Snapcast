"use client";

interface LoadingStateProps {
  status: "fetching-transcript" | "summarizing";
  streamedText?: string;
}

export function LoadingState({ status, streamedText }: LoadingStateProps) {
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
            : "AI가 요약하는 중..."}
        </span>
      </div>

      {status === "summarizing" && streamedText && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-2 font-mono">AI 응답 스트리밍...</p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
            {streamedText}
          </pre>
        </div>
      )}

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
