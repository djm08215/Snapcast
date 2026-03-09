export const maxDuration = 60;

import { extractVideoId } from "@/lib/transcript";
import type { TranscriptSegment } from "@/lib/types";
import { jsonResponse, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  try {
    const { url } = await req.json();
    if (!url) {
      return jsonResponse({ error: "URL이 필요합니다." }, origin, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return jsonResponse({ error: "유효하지 않은 YouTube URL입니다." }, origin, { status: 400 });
    }

    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "서버 설정 오류" }, origin, { status: 500 });
    }

    const res = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
      { headers: { "x-api-key": apiKey } }
    );

    console.log("[transcript] supadata status:", res.status, "videoId:", videoId);

    if (!res.ok) {
      if (res.status === 404) {
        return jsonResponse(
          { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
          origin,
          { status: 404 }
        );
      }
      const errText = await res.text();
      console.error("[transcript] supadata error:", errText);
      return jsonResponse(
        { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
        origin,
        { status: 500 }
      );
    }

    const data = await res.json();
    console.log("[transcript] supadata lang:", data.lang, "segments:", data.content?.length ?? 0);

    const segments: TranscriptSegment[] = (data.content ?? []).map(
      (item: { text: string; offset: number; duration: number }) => ({
        text: item.text,
        offset: item.offset,
        duration: item.duration,
      })
    );

    if (segments.length === 0) {
      return jsonResponse(
        { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
        origin,
        { status: 404 }
      );
    }

    return jsonResponse({ segments, videoId }, origin);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("[transcript] error:", message);
    return jsonResponse(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      origin,
      { status: 500 }
    );
  }
}
