"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTTS, TtsRate } from "@/hooks/useTTS";
import { SummaryResult } from "@/lib/types";

function buildSections(result: SummaryResult): string[] {
  const sections: string[] = [];

  // Section 0: overall summary
  const intro = result.videoTitle
    ? `${result.videoTitle}. 전체 요약. ${result.overallSummary}`
    : `전체 요약. ${result.overallSummary}`;
  sections.push(intro);

  // Section 1..n: each timeline point
  for (const point of result.timeline) {
    const text = `${point.title}. ${point.keyPoints.join(". ")}.`;
    sections.push(text);
  }

  return sections;
}

const RATES: TtsRate[] = [0.75, 1.0, 1.25, 1.5, 2.0];
const RATE_LABELS: Record<TtsRate, string> = {
  0.75: "0.75×",
  1.0: "1×",
  1.25: "1.25×",
  1.5: "1.5×",
  2.0: "2×",
};

export function TtsButton({ result }: { result: SummaryResult }) {
  const { plan, user } = useAuth();
  const { status, rate, currentSection, speak, jumpTo, prev, next, pause, resume, stop, setRate } =
    useTTS();

  if (status === "unsupported") return null;

  if (!user || plan !== "pro") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>TTS</span>
        <Link href="/pricing" className="text-blue-500 hover:underline text-xs">Pro 전용</Link>
      </div>
    );
  }

  const sections = buildSections(result);
  const isActive = status === "playing" || status === "paused";

  // Section labels: index 0 = 전체 요약, rest = timeline points
  const sectionLabels = [
    "전체 요약",
    ...result.timeline.map((p) => `${p.timestamp} ${p.title}`),
  ];

  return (
    <div className="w-full">
      {/* Idle: simple start button */}
      {status === "idle" && (
        <button
          onClick={() => speak(sections, 0)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12M6.343 9.657a8 8 0 000 4.686" />
          </svg>
          듣기
        </button>
      )}

      {/* Active: full player panel */}
      {isActive && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
          {/* Controls row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                onClick={prev}
                disabled={currentSection === 0}
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 transition-colors"
                title="이전 구간"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              {/* Play / Pause */}
              <button
                onClick={status === "playing" ? pause : resume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                {status === "playing" ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    일시정지
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    이어듣기
                  </>
                )}
              </button>

              {/* Next */}
              <button
                onClick={next}
                disabled={currentSection >= sections.length - 1}
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 transition-colors"
                title="다음 구간"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zM16 6h2v12h-2z" />
                </svg>
              </button>

              {/* Stop */}
              <button
                onClick={stop}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                title="정지"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
            </div>

            {/* Speed buttons */}
            <div className="flex items-center gap-1">
              {RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    rate === r
                      ? "bg-indigo-600 text-white"
                      : "text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  {RATE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline section list */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {sectionLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors truncate ${
                  currentSection === i
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-indigo-800 hover:bg-indigo-100"
                }`}
              >
                {currentSection === i && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 mb-0.5 animate-pulse" />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
