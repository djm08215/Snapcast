"use client";

import { useState, useEffect } from "react";
import type { HistoryItem } from "@/lib/history";
import { loadHistory, deleteHistory, clearHistory } from "@/lib/history";
import type { SummaryResult } from "@/lib/types";

interface Props {
  onSelect: (item: { url: string; videoId: string; result: SummaryResult }) => void;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export function History({ onSelect }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(loadHistory());
  }, [open]);

  if (items.length === 0 && !open) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        최근 요약 기록 {items.length > 0 && `(${items.length})`}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">아직 요약 기록이 없어요.</p>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <button
                      onClick={() => {
                        onSelect({ url: item.url, videoId: item.videoId, result: item.result });
                        setOpen(false);
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.result.videoTitle || item.url}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {timeAgo(item.savedAt)} · {item.result.timeline.length}개 구간
                      </p>
                    </button>
                    <button
                      onClick={() => setItems(deleteHistory(item.id))}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all rounded"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 px-4 py-2 text-right">
                <button
                  onClick={() => { clearHistory(); setItems([]); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  전체 삭제
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
