"use client";

import { useState, useCallback } from "react";
import type { SummaryResult } from "@/lib/types";
import { transcriptToText, estimateTokens, parseJson3 } from "@/lib/transcript";
import { saveHistory } from "@/lib/history";

type State =
  | { status: "idle" }
  | { status: "fetching-transcript" }
  | { status: "summarizing"; streamedText: string }
  | { status: "done"; result: SummaryResult; videoId: string; url: string }
  | { status: "error"; message: string };

export function useSummarize() {
  const [state, setState] = useState<State>({ status: "idle" });

  const summarize = useCallback(async (url: string) => {
    setState({ status: "fetching-transcript" });

    // 1. Fetch transcript
    let segments, videoId;
    try {
      // Step 1a: get caption URL from server (uses Innertube API)
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setState({ status: "error", message: data.error || "트랜스크립트 가져오기 실패" });
        return;
      }
      videoId = data.videoId;

      // Step 1b: fetch actual caption content from browser (bypasses datacenter IP block)
      const captionRes = await fetch(data.captionUrl + "&fmt=json3");
      if (!captionRes.ok) {
        setState({ status: "error", message: "자막을 가져올 수 없습니다." });
        return;
      }
      const captionJson = await captionRes.json();
      segments = parseJson3(captionJson);
      if (!segments.length) {
        setState({ status: "error", message: "자막 내용을 파싱할 수 없습니다." });
        return;
      }
    } catch {
      setState({ status: "error", message: "네트워크 오류가 발생했습니다." });
      return;
    }

    // 2. Convert to text (chunk if needed)
    const fullText = transcriptToText(segments);
    const tokenCount = estimateTokens(fullText);
    const transcriptText =
      tokenCount > 150000
        ? transcriptToText(segments.slice(0, Math.floor(segments.length * (150000 / tokenCount))))
        : fullText;

    // 3. Stream summarize
    setState({ status: "summarizing", streamedText: "" });

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptText }),
      });

      if (!res.ok || !res.body) {
        setState({ status: "error", message: "요약 API 오류" });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setState({ status: "error", message: parsed.error });
              return;
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setState({ status: "summarizing", streamedText: accumulated });
            }
          } catch {
            // ignore malformed lines
          }
        }
      }

      // 4. Parse JSON result
      try {
        // Extract JSON from accumulated text (might have extra text)
        const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON을 찾을 수 없습니다.");
        const result: SummaryResult = JSON.parse(jsonMatch[0]);
        setState({ status: "done", result, videoId, url });
        saveHistory({ url, videoId, result }); // fire-and-forget
      } catch {
        setState({
          status: "error",
          message: "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.",
        });
      }
    } catch {
      setState({ status: "error", message: "요약 중 오류가 발생했습니다." });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  const restoreFromHistory = useCallback(
    ({ url, videoId, result }: { url: string; videoId: string; result: SummaryResult }) => {
      setState({ status: "done", result, videoId, url });
    },
    []
  );

  return { state, summarize, reset, restoreFromHistory };
}
