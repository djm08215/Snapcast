export const runtime = "edge";
export const maxDuration = 60;

import { extractVideoId } from "@/lib/transcript";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

// Strategy: fetch the YouTube watch page with browser-like headers.
// Unlike the embed page, the watch page contains ytInitialPlayerResponse
// with full caption track data.
async function getCaptionUrlFromWatchPage(videoId: string): Promise<string | null> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=ko&gl=KR`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      // CONSENT cookie bypasses the YouTube cookie consent / GDPR banner
      "Cookie": "CONSENT=YES+cb; VISITOR_INFO1_LIVE=; GPS=1; PREF=f6=40000000&hl=ko&gl=KR",
    },
  });

  console.log("[transcript] watch page status:", res.status);
  if (!res.ok) return null;

  const html = await res.text();
  console.log("[transcript] watch page length:", html.length);

  // ytInitialPlayerResponse is inline in the HTML as a JS variable assignment
  const idx = html.indexOf("ytInitialPlayerResponse");
  if (idx === -1) {
    console.log("[transcript] ytInitialPlayerResponse not found in watch page");
    return null;
  }

  // Extract the JSON object starting from the first { after the variable name
  const jsonStart = html.indexOf("{", idx);
  if (jsonStart === -1) return null;

  // Walk braces to find the matching closing brace
  let depth = 0;
  let inString = false;
  let escape = false;
  let i = jsonStart;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) break; }
  }

  try {
    const playerResponse = JSON.parse(html.slice(jsonStart, i + 1));
    const tracks: CaptionTrack[] | undefined =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    console.log("[transcript] watch page captionTracks:", tracks?.length ?? 0);
    if (!tracks || tracks.length === 0) return null;
    const track = tracks.find((t) => t.languageCode === "ko") || tracks[0];
    console.log("[transcript] watch page track lang:", track.languageCode);
    return track.baseUrl;
  } catch (e) {
    console.error("[transcript] watch page JSON parse error:", e instanceof Error ? e.message : e);
    return null;
  }
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

    // Primary: parse watch page to get authenticated captionUrl
    const captionUrl = await getCaptionUrlFromWatchPage(videoId);

    if (captionUrl) {
      // Try fetching caption content server-side with authenticated URL
      // (signed tokens may bypass the CDN IP block)
      try {
        const contentRes = await fetch(captionUrl + "&fmt=json3");
        console.log("[transcript] server content fetch status:", contentRes.status);
        if (contentRes.ok) {
          const text = await contentRes.text();
          console.log("[transcript] server content length:", text.length);
          if (text.length > 100) {
            // Got actual content — return it for client to parse
            return Response.json({ captionContent: text, videoId });
          }
        }
      } catch (e) {
        console.error("[transcript] server content fetch error:", e instanceof Error ? e.message : e);
      }

      // Server content was empty/blocked — return URL to client for browser fetch
      return Response.json({ captionUrl, videoId });
    }

    return Response.json(
      { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
      { status: 404 }
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
