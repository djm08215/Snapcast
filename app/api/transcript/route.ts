export const maxDuration = 60;

import { extractVideoId } from "@/lib/transcript";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

// Call the Innertube player API directly, bypassing youtubei.js.
// youtubei.js discards caption data when the stream decipher fails (Vercel),
// but we only need the captions — not the stream URLs.
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

    const playerRes = await fetch(
      "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-YouTube-Client-Name": "1",
          "X-YouTube-Client-Version": "2.20231121.01.00",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          Origin: "https://www.youtube.com",
          Referer: "https://www.youtube.com/",
        },
        body: JSON.stringify({
          videoId,
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20231121.01.00",
              hl: "ko",
              gl: "KR",
            },
          },
        }),
      }
    );

    console.log("[transcript] player API status:", playerRes.status, "videoId:", videoId);

    if (!playerRes.ok) {
      return Response.json(
        { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const playerResponse = await playerRes.json();
    const tracks: CaptionTrack[] | undefined =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    console.log("[transcript] captionTracks:", tracks?.length ?? 0);

    if (!tracks || tracks.length === 0) {
      return Response.json(
        { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
        { status: 404 }
      );
    }

    const track = tracks.find((t) => t.languageCode === "ko") || tracks[0];
    console.log("[transcript] selected track lang:", track.languageCode);

    return Response.json({ captionUrl: track.baseUrl, videoId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("[transcript] error:", message);
    return Response.json(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
