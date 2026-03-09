export const maxDuration = 60;

import { Innertube } from "youtubei.js";
import { extractVideoId } from "@/lib/transcript";
import type { TranscriptSegment } from "@/lib/types";

interface Json3Event {
  tStartMs: number;
  dDurationMs?: number;
  segs?: { utf8: string }[];
}

function parseJson3(json3: { events?: Json3Event[] }): TranscriptSegment[] {
  return (json3.events ?? [])
    .filter((e) => e.segs && e.segs.length > 0)
    .map((e) => ({
      text: e.segs!.map((s) => s.utf8).join("").trim(),
      offset: e.tStartMs,
      duration: e.dDurationMs ?? 0,
    }))
    .filter((s) => s.text.length > 0);
}

async function fetchTranscript(videoId: string): Promise<TranscriptSegment[]> {
  const yt = await Innertube.create({ retrieve_player: false });
  const info = await yt.getInfo(videoId);
  const tracks = info.captions?.caption_tracks;

  if (!tracks || tracks.length === 0) {
    throw new Error("No captions available");
  }

  // Prefer Korean, fallback to first available
  const track =
    tracks.find((t: { language_code: string }) => t.language_code === "ko") ||
    tracks[0];

  const url = new URL(track.base_url + "&fmt=json3");
  const res = await yt.session.http.fetch(url);

  if (!res.ok) {
    throw new Error(`Caption fetch failed: ${res.status}`);
  }

  const json3 = await res.json() as { events?: Json3Event[] };
  return parseJson3(json3);
}

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

    const segments = await fetchTranscript(videoId);

    if (segments.length === 0) {
      return Response.json(
        { error: "이 영상에는 자막(트랜스크립트)이 없습니다. 자막이 활성화된 영상을 시도해주세요." },
        { status: 500 }
      );
    }

    return Response.json({ segments, videoId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "트랜스크립트를 가져올 수 없습니다.";
    console.error("transcript error:", message);

    const isNoCaption =
      message.includes("No captions") || message.includes("Transcript");

    return Response.json(
      {
        error: isNoCaption
          ? "이 영상에는 자막(트랜스크립트)이 없습니다."
          : "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
