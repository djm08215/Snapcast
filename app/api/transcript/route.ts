export const maxDuration = 60;

import { Innertube } from "youtubei.js";
import { extractVideoId } from "@/lib/transcript";

// Returns caption URL only — actual fetching is done client-side
// to avoid YouTube bot detection on datacenter IPs.
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

    const yt = await Innertube.create({ retrieve_player: false });
    const info = await yt.getInfo(videoId);
    const tracks = info.captions?.caption_tracks;

    if (!tracks || tracks.length === 0) {
      return Response.json(
        { error: "이 영상에는 자막(트랜스크립트)이 없습니다." },
        { status: 500 }
      );
    }

    const track =
      tracks.find((t: { language_code: string }) => t.language_code === "ko") ||
      tracks[0];

    // Return the URL — client will fetch actual caption content
    return Response.json({
      captionUrl: track.base_url,
      videoId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("transcript error:", message);
    return Response.json(
      { error: "트랜스크립트를 가져올 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
