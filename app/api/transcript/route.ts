export const runtime = "edge";
export const maxDuration = 60;

import { extractVideoId } from "@/lib/transcript";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

async function fetchCaptionTracksFromInnertube(
  videoId: string
): Promise<CaptionTrack[] | null> {
  const clients: Array<{ headers: Record<string, string>; context: Record<string, unknown> }> = [
    {
      headers: { "X-YouTube-Client-Name": "5", "X-YouTube-Client-Version": "19.09.3", "User-Agent": "com.google.ios.youtube/19.09.3 (iPhone16,2; U; CPU iOS 17_1_2 like Mac OS X)" },
      context: { client: { clientName: "IOS", clientVersion: "19.09.3", deviceModel: "iPhone16,2", hl: "ko", gl: "KR" } },
    },
    {
      headers: { "X-YouTube-Client-Name": "2", "X-YouTube-Client-Version": "2.20231121.01.00", "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36" },
      context: { client: { clientName: "MWEB", clientVersion: "2.20231121.01.00", hl: "ko", gl: "KR" } },
    },
    {
      headers: { "X-YouTube-Client-Name": "56", "X-YouTube-Client-Version": "1.20231121.01.00", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36", Origin: "https://www.youtube.com", Referer: "https://www.youtube.com/" },
      context: { client: { clientName: "WEB_EMBEDDED_PLAYER", clientVersion: "1.20231121.01.00", hl: "ko", gl: "KR" } },
    },
    {
      headers: { "X-YouTube-Client-Name": "3", "X-YouTube-Client-Version": "19.09.37", "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip" },
      context: { client: { clientName: "ANDROID", clientVersion: "19.09.37", androidSdkVersion: 30, hl: "ko", gl: "KR" } },
    },
    {
      headers: { "X-YouTube-Client-Name": "85", "X-YouTube-Client-Version": "2.0", "User-Agent": "Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/538.1 (KHTML, like Gecko) Version/6.0 TV Safari/538.1" },
      context: { client: { clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", clientVersion: "2.0", hl: "ko", gl: "KR" } },
    },
    {
      headers: { "X-YouTube-Client-Name": "1", "X-YouTube-Client-Version": "2.20231121.01.00", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36", Origin: "https://www.youtube.com", Referer: "https://www.youtube.com/" },
      context: { client: { clientName: "WEB", clientVersion: "2.20231121.01.00", hl: "ko", gl: "KR" } },
    },
  ];

  for (const client of clients) {
    try {
      const res = await fetch(
        "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...client.headers },
          body: JSON.stringify({ videoId, context: client.context }),
        }
      );
      const name = client.headers["X-YouTube-Client-Name"];
      console.log("[transcript] client", name, "status:", res.status);
      if (!res.ok) continue;
      const data = await res.json();
      const tracks: CaptionTrack[] | undefined =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      console.log("[transcript] client", name, "tracks:", tracks?.length ?? 0);
      if (tracks && tracks.length > 0) return tracks;
    } catch (e) {
      console.error("[transcript] client error:", e instanceof Error ? e.message : e);
    }
  }
  return null;
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

    const tracks = await fetchCaptionTracksFromInnertube(videoId);

    if (tracks && tracks.length > 0) {
      const track = tracks.find((t) => t.languageCode === "ko") || tracks[0];
      console.log("[transcript] selected track lang:", track.languageCode);
      return Response.json({ captionUrl: track.baseUrl, videoId });
    }

    // Last resort: return simple timedtext URLs for client-side fetching.
    // The browser can access YouTube from a real IP without IP blocking.
    console.log("[transcript] all clients returned 0 tracks — falling back to client-side timedtext URLs");
    return Response.json({
      videoId,
      captionUrls: [
        `https://www.youtube.com/api/timedtext?v=${videoId}&lang=ko&fmt=json3`,
        `https://www.youtube.com/api/timedtext?v=${videoId}&lang=ko&kind=asr&fmt=json3`,
        `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
        `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr&fmt=json3`,
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("[transcript] error:", message);
    return Response.json(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
