"use client";

import dynamic from "next/dynamic";
import type { SummaryResult } from "@/lib/types";

interface Props {
  result: SummaryResult;
  videoUrl: string;
}

// Inner component (loaded only client-side)
function PdfButtonInner({ result, videoUrl }: Props) {
  const handleClick = async () => {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result, videoUrl }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const title = result.videoTitle?.slice(0, 30).replace(/[/\\?%*:|"<>]/g, "-") || "podcast-summary";
    a.download = `${title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium transition-colors shadow-sm"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      PDF 다운로드
    </button>
  );
}

const PdfDownloadButton = dynamic(() => Promise.resolve(PdfButtonInner), {
  ssr: false,
  loading: () => (
    <button
      disabled
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed"
    >
      PDF 준비 중...
    </button>
  ),
});

export { PdfDownloadButton };
