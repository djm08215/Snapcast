"use client";

import { useSummarize } from "@/hooks/useSummarize";
import { UrlForm } from "@/components/UrlForm";
import { LoadingState } from "@/components/LoadingState";
import { Timeline } from "@/components/Timeline";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { History } from "@/components/History";
import { AppNavBar } from "@/components/AppNavBar";

export default function Home() {
  const { state, summarize, reset, restoreFromHistory } = useSummarize();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <AppNavBar
        showReset={state.status === "done"}
        onReset={reset}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            유튜브 영상을 AI로 요약해드립니다
          </h1>
          <p className="text-gray-500 text-base">
            팟캐스트, 강의, 인터뷰 등 정보성 영상의 핵심을 타임라인으로 정리해드립니다.
          </p>
        </div>

        {/* Form */}
        <div className="flex justify-center mb-8">
          <UrlForm
            onSubmit={summarize}
            disabled={state.status === "fetching-transcript" || state.status === "summarizing"}
          />
        </div>

        {/* Loading */}
        {(state.status === "fetching-transcript" || state.status === "summarizing") && (
          <div className="flex justify-center">
            <LoadingState
              status={state.status}
              streamedText={state.status === "summarizing" ? state.streamedText : undefined}
            />
          </div>
        )}

        {/* Error */}
        {state.status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-red-700 font-medium mb-1">오류가 발생했습니다</p>
            <p className="text-red-500 text-sm">{state.message}</p>
            <button
              onClick={reset}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Result */}
        {state.status === "done" && (
          <div className="space-y-8">
            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                {state.result.videoTitle && (
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {state.result.videoTitle}
                  </h2>
                )}
                <a
                  href={state.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  원본 영상 보기 →
                </a>
              </div>
              <PdfDownloadButton result={state.result} videoUrl={state.url} />
            </div>

            {/* Overall Summary */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center font-bold">요</span>
                전체 요약
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {state.result.overallSummary}
              </p>
            </section>

            {/* Timeline */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center font-bold">타</span>
                타임라인 ({state.result.timeline.length}개 구간)
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                각 항목을 클릭하면 해당 시간대로 영상이 열립니다.
              </p>
              <Timeline timeline={state.result.timeline} videoId={state.videoId} />
            </section>
          </div>
        )}

        {/* History */}
        {(state.status === "idle" || state.status === "error") && (
          <div className="flex justify-center mt-6">
            <History onSelect={restoreFromHistory} />
          </div>
        )}

        {/* Empty state guide */}
        {state.status === "idle" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: "🎙️", title: "팟캐스트", desc: "긴 팟캐스트 영상의 핵심만 빠르게 확인" },
              { icon: "🎓", title: "강의·강연", desc: "교육 영상의 학습 포인트를 정리" },
              { icon: "📰", title: "뉴스·인터뷰", desc: "인터뷰와 뉴스 분석 영상 요약" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/60 rounded-xl p-4 text-center border border-gray-100"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-semibold text-gray-800 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
