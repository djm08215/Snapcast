export const maxDuration = 60;

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
      return Response.json({ error: "유효하지 않은 YouTube URL입니다." }, { status: 400 });
    }

    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    // Try Korean first, fall back to any available language
    const res = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
      { headers: { "x-api-key": apiKey } }
    );

    console.log("[transcript] supadata status:", res.status, "videoId:", videoId);

    if (!res.ok) {
      if (res.status === 404) {
        return Response.json(
          { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
          { status: 404 }
        );
      }
      const errText = await res.text();
      console.error("[transcript] supadata error:", errText);
      return Response.json(
        { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
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
      return Response.json(
        { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
        { status: 404 }
      );
    }

    return Response.json({ segments, videoId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("[transcript] error:", message);
    return Response.json(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
