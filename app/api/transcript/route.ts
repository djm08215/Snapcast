export const maxDuration = 60;

import { extractVideoId } from "@/lib/transcript";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

interface PlayerResponse {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };
}

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

    // Fetch YouTube embed page — less IP-restricted than main page or Innertube player
    const embedRes = await fetch(`https://www.youtube.com/embed/${videoId}?hl=ko`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    });

    console.log("[transcript] embed fetch status:", embedRes.status, "videoId:", videoId);

    if (embedRes.ok) {
      const html = await embedRes.text();
      console.log("[transcript] embed html length:", html.length);

      // Extract ytInitialPlayerResponse (minified single-line JSON in embed page)
      const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/);
      if (match) {
        try {
          const playerResponse: PlayerResponse = JSON.parse(match[1]);
          const tracks =
            playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          console.log("[transcript] captionTracks from embed:", tracks?.length ?? 0);

          if (tracks && tracks.length > 0) {
            const track =
              tracks.find((t) => t.languageCode === "ko") || tracks[0];
            console.log("[transcript] selected track lang:", track.languageCode);
            return Response.json({ captionUrl: track.baseUrl, videoId });
          } else {
            return Response.json(
              { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
              { status: 404 }
            );
          }
        } catch (parseErr) {
          console.error(
            "[transcript] JSON parse error:",
            parseErr instanceof Error ? parseErr.message : parseErr
          );
        }
      } else {
        console.log("[transcript] ytInitialPlayerResponse not found");
        console.log("[transcript] html snippet:", html.slice(0, 300));
      }
    }

    return Response.json(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("[transcript] error:", message);
    return Response.json(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
