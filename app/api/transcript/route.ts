export const maxDuration = 60;

import { Innertube } from "youtubei.js";
import { extractVideoId } from "@/lib/transcript";
import type { TranscriptSegment } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return Response.json(
        { error: "유효하지 않은 YouTube URL입니다." },
        { status: 400 }
      );
    }

    const yt = await Innertube.create();
    const info = await yt.getInfo(videoId);

    // Detailed logging to diagnose Vercel IP issues
    console.log("[transcript] videoId:", videoId);
    console.log("[transcript] captions type:", typeof info.captions);
    console.log("[transcript] caption_tracks count:", info.captions?.caption_tracks?.length ?? "N/A");

    // --- Strategy 1: getTranscript() via Innertube JSON API (not CDN) ---
    try {
      const transcriptData = await info.getTranscript();
      const segments: TranscriptSegment[] =
        transcriptData?.transcript?.content?.body?.initial_segments
          ?.map((seg: { start_ms: string; end_ms: string; snippet: { toString: () => string } }) => ({
            offset: Number(seg.start_ms),
            duration: Number(seg.end_ms) - Number(seg.start_ms),
            text: seg.snippet.toString().replace(/\n/g, " ").trim(),
          }))
          .filter((s: TranscriptSegment) => s.text) ?? [];

      if (segments.length > 0) {
        console.log("[transcript] getTranscript() succeeded, segments:", segments.length);
        return Response.json({ segments, videoId });
      }
      console.log("[transcript] getTranscript() returned 0 segments");
    } catch (e) {
      console.error("[transcript] getTranscript() error:", e instanceof Error ? e.message : e);
    }

    // --- Strategy 2: return caption URL for client-side fetch ---
    const tracks = info.captions?.caption_tracks;
    if (!tracks || tracks.length === 0) {
      console.error("[transcript] No caption tracks found at all");
      return Response.json(
        { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
        { status: 500 }
      );
    }

    const track =
      tracks.find((t: { language_code: string }) => t.language_code === "ko") ||
      tracks[0];

    console.log("[transcript] falling back to captionUrl, lang:", track.language_code);
    return Response.json({ captionUrl: track.base_url, videoId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("[transcript] top-level error:", message);
    return Response.json(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
